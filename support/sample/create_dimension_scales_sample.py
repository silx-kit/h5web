import os
import sys

import h5py
import numpy as np

BASE_PATH = os.path.dirname(os.path.realpath(sys.argv[0]))
DIST_PATH = os.path.join(BASE_PATH, "dist")
os.makedirs(DIST_PATH, exist_ok=True)

# f(t) = t*sin(1/t) oscillates ever faster as t -> 0, so resolving it requires a
# sampling density that grows like 1/t**2. Sampling uniformly in the phase
# phi = 1/t does exactly that, giving a time axis whose spacing spans four
# orders of magnitude - a spacing ratio no index axis can represent.
#
# Pure 1/t**2 sampling would leave only a handful of points where the function
# is smooth, drawing it as a visible polygon, so MAX_SPACING adds a coarse
# uniform grid over the tail. That caps the widest spacing, so the realized
# ratio is MAX_SPACING/min(dt) and grows with SAMPLES_PER_PERIOD - the script
# prints it. `float32` is ample: the tightest spacing sits far above the
# `float32` resolution at T_MIN, so the time axis stays strictly increasing.
T_MIN = 1.0e-3
T_MAX = 1.0
SAMPLES_PER_PERIOD = 12
MAX_SPACING = 0.01
DTYPE = np.float32


def adaptive_times():
    """Times uniform in phase phi = 1/t, i.e. clustered as t -> 0."""
    phi_min, phi_max = 1.0 / T_MAX, 1.0 / T_MIN
    n_periods = (phi_max - phi_min) / (2.0 * np.pi)
    count = int(n_periods * SAMPLES_PER_PERIOD)
    phi = np.linspace(phi_max, phi_min, count)  # descending phi => ascending t
    coarse = np.arange(T_MIN, T_MAX, MAX_SPACING)
    return np.unique(np.concatenate([1.0 / phi, coarse]))


with h5py.File(os.path.join(DIST_PATH, "dimension_scales.h5"), "w") as h5:
    times = adaptive_times()
    values = (times * np.sin(1.0 / times)).astype(DTYPE)
    times = times.astype(DTYPE)

    # `make_scale` writes CLASS="DIMENSION_SCALE" and NAME on the scale dataset
    scale = h5.create_dataset("times", data=times)
    scale.attrs["units"] = "seconds"
    scale.make_scale("times")

    # `attach_scale` writes DIMENSION_LIST here and REFERENCE_LIST on the scale
    tsin = h5.create_dataset("tsin1divt", data=values)
    tsin.attrs["units"] = "volts"
    tsin.dims[0].label = "time"
    tsin.dims[0].attach_scale(scale)

    # A scale may be created without a name, in which case HDF5 records an empty
    # NAME rather than omitting it - the axis label then falls back elsewhere
    unnamed = h5.create_dataset("times_unnamed", data=times)
    unnamed.attrs["units"] = "seconds"
    unnamed.make_scale()

    unlabelled = h5.create_dataset("tsin1divt_unnamed_scale", data=values)
    unlabelled.attrs["units"] = "volts"
    unlabelled.dims[0].attach_scale(unnamed)

    spacing = np.diff(times)
    print(f"samples     {times.size}")
    print(f"t range     [{times[0]:.3e}, {times[-1]:.3e}]")
    print(f"spacing     [{spacing.min():.3e}, {spacing.max():.3e}]")
    print(f"ratio       {spacing.max() / spacing.min():.3e}")
