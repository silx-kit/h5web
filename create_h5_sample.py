import os
import sys
import h5py
import numpy as np

if sys.version_info.major < 3:
    raise RuntimeError("Python 2 is not supported")

BASE_PATH = os.path.dirname(os.path.realpath(sys.argv[0]))
DIST_PATH = os.path.join(BASE_PATH, "dist")
os.makedirs(DIST_PATH, exist_ok=True)

h5py.get_config().track_order = True


def add_empty(group, name, dtype=None):
    dataset = group.create_dataset(name + "_empty", data=h5py.Empty(dtype))
    return dataset


def add_scalar(group, name, data=None, dtype=None):
    dataset = group.create_dataset(name + "_scalar", (), dtype, data)
    return dataset


def add_array(group, name, data=None, dtype=None, shape=None):
    dataset = group.create_dataset(
        name + "_{0}D".format(len(shape or data.shape)), shape, dtype, data
    )
    return dataset


def print_h5t_class(dataset):
    # https://nasa.github.io/MISR-Toolkit/html/_h5_tpublic_8h_source.html
    print("H5T_class=" + str(dataset.id.get_type().get_class()))


with h5py.File(os.path.join(DIST_PATH, "sample.h5"), "w") as h5:
    # === H5T_INTEGER ===

    add_scalar(h5, "int8", np.int8(np.iinfo(np.int8).min))
    add_array(h5, "int8", np.array([[0, 1, 2], [3, 4, 5]], np.int8))
    add_scalar(h5, "int16", np.int16(np.iinfo(np.int16).min))
    add_array(h5, "int16", np.array([[0, 1, 2], [3, 4, 5]], np.int16))
    add_scalar(h5, "int32", np.int32(np.iinfo(np.int32).min))
    add_scalar(h5, "int32_BE", 0, np.dtype(">i"))
    add_array(h5, "int32", np.array([[0, 1, 2], [3, 4, 5]], np.int32))
    add_scalar(h5, "int64", np.int64(np.iinfo(np.int64).min))
    add_array(h5, "int64", np.array([[0, 1, 2], [3, 4, 5]], np.int64))

    add_scalar(h5, "uint8", np.uint8(np.iinfo(np.uint8).max))
    add_array(h5, "uint8", np.array([[0, 1, 2], [3, 4, 5]], np.uint8))
    add_scalar(h5, "uint16", np.uint16(np.iinfo(np.uint16).max))
    add_array(h5, "uint16", np.array([[0, 1, 2], [3, 4, 5]], np.uint16))
    add_scalar(h5, "uint32", np.uint32(np.iinfo(np.uint32).max))
    add_array(h5, "uint32", np.array([[0, 1, 2], [3, 4, 5]], np.uint32))
    add_scalar(h5, "uint64", np.uint64(np.iinfo(np.uint64).max))
    add_array(
        h5,
        "uint64",
        np.array(
            [[[0, 1], [2, 3]], [[4, 5], [6, np.uint64(np.iinfo(np.uint64).max)]]],
            np.uint64,
        ),
    )

    # === H5T_FLOAT ===

    add_scalar(h5, "float16", np.float16(np.finfo(np.float16).smallest_normal))
    add_array(h5, "float16", np.array([[0, 1, 2], [3, 4, 5]], np.float16))
    add_empty(h5, "float32", np.float32)
    add_scalar(h5, "float32", np.float32(np.finfo(np.float32).smallest_normal))
    add_scalar(h5, "float32_BE", 0, np.dtype(">f"))
    add_array(h5, "float32", np.array([[0, 1, 2], [3, 4, 5]], np.float32))
    add_scalar(h5, "float64", np.float64(np.finfo(np.float64).smallest_normal))

    add_scalar(h5, "float64_nan", np.nan)
    add_scalar(h5, "float64_inf", np.inf)
    add_scalar(h5, "float64_ninf", np.NINF)
    add_scalar(h5, "float64_zero", np.PZERO)
    add_scalar(h5, "float64_nzero", np.NZERO)
    add_scalar(h5, "float64_pi", np.pi)
    add_array(
        h5,
        "float64",
        np.array([[0, 1, np.inf, 3, 4], [3, 4, np.nan, 6, 7], [6, 7, np.NINF, 9, 10]]),
    )

    add_scalar(h5, "float128", np.float128(np.finfo(np.float128).smallest_normal))
    add_array(
        h5,
        "float128",
        np.array([[0, 1, 2], [3, 4, np.finfo(np.float128).max]], np.float128),
    )

    # === H5T_TIME ===

    # Not supported by h5py

    # === H5T_STRING ===

    add_empty(h5, "ascii_vlen", h5py.string_dtype("ascii"))
    add_scalar(h5, "ascii_vlen", b"Some text")
    add_scalar(
        h5,
        "ascii_fixed",
        np.string_("Some text"),
    )
    add_scalar(h5, "utf8_vlen", "Some text")
    add_array(h5, "utf8_vlen", np.array(["foo", "bar", "baz"], h5py.string_dtype()))
    add_scalar(h5, "utf8_fixed", "Some text", h5py.string_dtype("utf-8", 9))

    # === H5T_BITFIELD ===

    # h5py syntax unknown

    # === H5T_OPAQUE ===

    add_scalar(h5, "byte_string", np.void(b"\x00\x11\x22"))
    add_array(
        h5,
        "byte_string",
        np.array([np.void(b"\x00"), np.void(b"\x11"), np.void(b"\x22")]),
    )
    add_scalar(h5, "datetime64", np.void(np.datetime64("2019-09-22T17:38:30")))
    add_scalar(h5, "datetime64_not-a-time", np.void(np.datetime64("NaT")))

    # === H5T_COMPOUND (and H5T_ARRAY) ===

    add_scalar(
        h5,
        "complex64",
        np.complex64(
            np.finfo(np.complex64).smallest_normal + np.finfo(np.complex64).max * 1j
        ),
    )
    add_array(
        h5, "complex64", np.array([[1 + 2j, 3 + 4j], [5 + 6j, 7 + 8j]], np.complex64)
    ),
    add_scalar(
        h5,
        "complex128",
        np.complex128(
            np.finfo(np.complex128).smallest_normal + np.finfo(np.complex128).max * 1j
        ),
    )
    add_scalar(h5, "complex128_BE", 1 + 2j, np.dtype(">c16"))
    add_array(
        h5, "complex128", np.array([[1 + 2j, 3 + 4j], [5 + 6j, 7 + 8j]], np.complex128)
    ),
    add_scalar(
        h5,
        "complex256",
        np.complex256(
            np.finfo(np.complex256).smallest_normal + np.finfo(np.complex256).max * 1j
        ),
    )
    add_array(
        h5, "complex256", np.array([[1 + 2j, 3 + 4j], [5 + 6j, 7 + 8j]], np.complex256)
    ),

    add_scalar(
        h5,
        "compound",
        (1, 2.0, "foo"),
        [("bigint", np.int64), ("double", np.float64), ("utf-8", h5py.string_dtype())],
    )
    for_ref = add_array(
        h5,
        "compound",
        np.array(
            [(1, np.nan, "foo"), (2, np.inf, "bar"), (3, np.NZERO, "baz")],
            [
                ("bigint", np.int64),
                ("double", np.float64),
                ("utf-8", h5py.string_dtype()),
            ],
        ),
    )
    add_scalar(
        h5,
        "compound_nested",
        ((True, 1 + 2j, 3),),
        [
            (
                "nested",
                [
                    ("bool", np.bool_),
                    ("cplx", np.complex64),
                    ("bigint", np.int64),
                ],
            )
        ],
    )

    comp = add_array(
        h5,
        "compound_array_vlen",
        np.array(
            [
                (
                    np.array([0, 1], np.float32),
                    np.array([0], np.uint64),
                ),
                (
                    np.array([2, 3], np.float32),
                    np.array([0, 1], np.uint64),
                ),
                (
                    np.array([4, 5], np.float32),
                    np.array([0, 1, 2], np.uint64),
                ),
            ],
            [("arr", np.float32, (2,)), ("vlen", h5py.vlen_dtype(np.uint64))],
        ),
    )

    # === H5T_REFERENCE ===

    add_scalar(h5, "reference", for_ref.ref, h5py.ref_dtype)
    add_scalar(
        h5,
        "reference_region",
        for_ref.regionref[0:1],
        h5py.regionref_dtype,
    )

    # === H5T_ENUM ===

    add_empty(h5, "bool", h5py.enum_dtype({"FALSE": 0, "TRUE": 1}))
    add_scalar(h5, "bool_false", False)
    add_scalar(h5, "bool_true", True)
    add_array(
        h5, "bool", np.array([[True, False, True, True], [False, False, True, False]])
    )

    add_scalar(
        h5,
        "enum_uint8",
        1,
        h5py.enum_dtype({"A": 0, "B": 1}),
    )
    add_scalar(
        h5,
        "enum_int32",
        256,
        h5py.enum_dtype({"A": 256, "B": 257}, np.int32),
    )

    # === H5T_VLEN ===

    # https://docs.h5py.org/en/stable/special.html#arbitrary-vlen-data
    scalar_vlen = add_scalar(h5, "vlen_int8", dtype=h5py.vlen_dtype(np.int8))
    scalar_vlen[()] = [0, 1]

    # https://docs.h5py.org/en/stable/special.html#arbitrary-vlen-data
    scalar_vlen = add_array(
        h5, "vlen_int64", shape=(3,), dtype=h5py.vlen_dtype(np.int64)
    )
    scalar_vlen[0] = [0]
    scalar_vlen[1] = [0, 1]
    scalar_vlen[2] = [0, 1, 2]

    # === H5T_ARRAY ===

    # cf. section `H5T_COMPOUND` above
