import { type ScaleType } from '@h5web/shared/vis-models';

import { GLSL_IS_SUPPORTED, GLSL_SCALE } from '../heatmap/utils';
import { VolumeRenderMode } from './models';

export const VOLUME_VERTEX_SHADER = /* glsl */ `
  out vec3 vPosition;
  flat out vec3 vOrigin;

  void main() {
    vPosition = position;
    vOrigin = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const MODE_DEFINES: Record<VolumeRenderMode, string> = {
  [VolumeRenderMode.MIP]: 'MODE_MIP',
  [VolumeRenderMode.DVR]: 'MODE_DVR',
  [VolumeRenderMode.Iso]: 'MODE_ISO',
};

/*
 * Single-pass ray marcher. The bounding box is rendered with back faces only,
 * so that rays are cast even when the camera is inside the volume. Rays are
 * marched in texture space ([0, 1]^3) with a step size expressed in voxels,
 * jittered per pixel to hide wood-grain artefacts.
 */
export function getVolumeFragmentShader(
  mode: VolumeRenderMode,
  scaleType: ScaleType,
): string {
  return /* glsl */ `
    precision highp float;
    precision highp sampler3D;

    #define ${MODE_DEFINES[mode]}

    uniform sampler3D volume;
    uniform sampler2D colorMap;
    uniform vec3 dims;

    uniform float domainMin;
    uniform float oneOverRange;
    uniform float gammaExponent;
    uniform float normRevertFactor;
    uniform float valueOffset;

    uniform float samplesPerVoxel;
    uniform float opacity;
    uniform float threshold;

    in vec3 vPosition;
    flat in vec3 vOrigin;
    out vec4 fragColor;

    const float oneOverLog10 = 0.43429448190325176;
    const int MAX_STEPS = 4096;

    bool isSupported(float value) {
      return ${GLSL_IS_SUPPORTED[scaleType] || 'true'};
    }

    float scale(float value) {
      return ${GLSL_SCALE[scaleType] || 'value'};
    }

    // Normalized value in [0, 1], or -1 for NaN and values unsupported by the scale
    float sampleVolume(vec3 p) {
      float value = texture(volume, p).r * normRevertFactor + valueOffset;
      if (isnan(value) || !isSupported(value)) {
        return -1.;
      }
      float scaledValue = scale(value);
      if (oneOverRange == 0.) {
        // Empty domain: step at the domain bound, consistently with the colour bar
        return scaledValue >= domainMin ? 1. : 0.;
      }
      return pow(clamp(oneOverRange * (scaledValue - domainMin), 0., 1.), gammaExponent);
    }

    // Gradient of the normalized field, in voxel units (central differences)
    vec3 gradient(vec3 p) {
      vec3 d = 1. / dims;
      return 0.5 * vec3(
        max(sampleVolume(p + vec3(d.x, 0., 0.)), 0.) - max(sampleVolume(p - vec3(d.x, 0., 0.)), 0.),
        max(sampleVolume(p + vec3(0., d.y, 0.)), 0.) - max(sampleVolume(p - vec3(0., d.y, 0.)), 0.),
        max(sampleVolume(p + vec3(0., 0., d.z)), 0.) - max(sampleVolume(p - vec3(0., 0., d.z)), 0.)
      );
    }

    // Two-sided Blinn-Phong with a headlight; shading fades out in homogeneous
    // regions (i.e. where the gradient is too weak to give meaningful normals)
    vec3 shade(vec3 color, vec3 grad, vec3 viewDir, float minGradient) {
      float len = length(grad);
      if (len < 1e-6) {
        return color;
      }
      float nDotV = abs(dot(grad / len, viewDir));
      vec3 lit = color * (0.3 + 0.8 * nDotV) + 0.3 * pow(nDotV, 48.);
      return mix(color, lit, smoothstep(0., minGradient, len));
    }

    vec2 intersectBox(vec3 origin, vec3 dir) {
      vec3 invDir = 1. / dir;
      vec3 t0 = -origin * invDir;
      vec3 t1 = (1. - origin) * invDir;
      vec3 tMin = min(t0, t1);
      vec3 tMax = max(t0, t1);
      return vec2(max(max(tMin.x, tMin.y), tMin.z), min(min(tMax.x, tMax.y), tMax.z));
    }

    void main() {
      vec3 origin = vOrigin + 0.5;
      vec3 dir = normalize(vPosition - vOrigin);

      vec2 bounds = intersectBox(origin, dir);
      bounds.x = max(bounds.x, 0.);
      if (bounds.x >= bounds.y) {
        discard;
      }

      vec3 voxelDir = dir * dims;
      vec3 viewDir = -normalize(voxelDir);
      float rayLength = bounds.y - bounds.x;
      float dt = 1. / (length(voxelDir) * samplesPerVoxel);
      int steps = int(ceil(rayLength / dt));
      if (steps > MAX_STEPS) {
        // Stretch steps so the samples still span the whole ray
        steps = MAX_STEPS;
        dt = rayLength / float(MAX_STEPS);
      }

      // Interleaved gradient noise
      float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      vec3 p = origin + dir * (bounds.x + jitter * dt);
      vec3 delta = dir * dt;

      #if defined(MODE_MIP)
        float maxValue = -1.;
        for (int i = 0; i < steps; i++) {
          maxValue = max(maxValue, sampleVolume(p));
          if (maxValue >= 1.) {
            break;
          }
          p += delta;
        }
        if (maxValue < threshold) {
          discard;
        }
        fragColor = vec4(texture(colorMap, vec2(maxValue, 0.5)).rgb, 1.);

      #elif defined(MODE_DVR)
        // Opacity correction so that the result does not depend on the sampling rate
        float alphaExponent = dt * length(voxelDir); // voxels per step
        float oneOverRamp = 1. / max(1. - threshold, 1e-6);
        vec4 acc = vec4(0.);

        for (int i = 0; i < steps; i++) {
          float value = sampleVolume(p);
          if (value > threshold) {
            float voxelAlpha = clamp(opacity * (value - threshold) * oneOverRamp, 0., 0.999);
            float alpha = 1. - pow(1. - voxelAlpha, alphaExponent);
            vec3 color = texture(colorMap, vec2(value, 0.5)).rgb;
            if (voxelAlpha > 0.002) {
              // Skip costly gradient for nearly transparent samples (independently of sampling rate)
              color = shade(color, gradient(p), viewDir, 0.01);
            }
            acc += (1. - acc.a) * vec4(color * alpha, alpha);
            if (acc.a > 0.98) {
              break;
            }
          }
          p += delta;
        }
        if (acc.a < 0.002) {
          discard;
        }
        fragColor = acc; // premultiplied

      #else
        vec3 prev = p;
        for (int i = 0; i < steps; i++) {
          if (sampleVolume(p) > threshold) {
            // Refine hit point with a few bisection steps
            vec3 lo = prev;
            vec3 hi = p;
            for (int j = 0; j < 6; j++) {
              vec3 mid = 0.5 * (lo + hi);
              if (sampleVolume(mid) > threshold) {
                hi = mid;
              } else {
                lo = mid;
              }
            }
            vec3 color = texture(colorMap, vec2(threshold, 0.5)).rgb;
            fragColor = vec4(shade(color, gradient(hi), viewDir, 1e-6), 1.);
            return;
          }
          prev = p;
          p += delta;
        }
        discard;
      #endif
    }
  `;
}
