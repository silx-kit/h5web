export enum ComplexVisType {
  Phase = 'Phase',
  Amplitude = 'Amplitude',
  PhaseAmplitude = 'Phase and amplitude',
}

export type ComplexLineVisType =
  | ComplexVisType.Phase
  | ComplexVisType.Amplitude;

export const VIS_TYPE_SYMBOLS = {
  [ComplexVisType.Phase]: 'φ',
  [ComplexVisType.Amplitude]: '𝓐',
  [ComplexVisType.PhaseAmplitude]: 'φ𝓐',
};
