#!/usr/bin/env python
# coding: utf-8
"""Tornado-based server sample code"""
import argparse
import os
import tornado.web
import tornado.ioloop

# Disable libhdf5 file locking since h5grove is only reading files
# This needs to be done before any import of h5py, so before h5grove import
os.environ["HDF5_USE_FILE_LOCKING"] = "FALSE"

from h5grove.tornado_utils import get_handlers  # noqa


def parser_fn():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-p", "--port", type=int, default=8888, help="Port the server is listening on"
    )
    parser.add_argument(
        "--ip", default="localhost", help="IP the server is listening on"
    )
    parser.add_argument(
        "--basedir",
        default=".",
        help="Base directory from which to retrieve HDF5 files",
    )
    return parser


if __name__ == "__main__":
    parser = parser_fn()
    options = parser.parse_args()

    base_dir = os.path.abspath(options.basedir)

    app = tornado.web.Application(get_handlers(base_dir, allow_origin="*"), debug=True)
    app.listen(options.port, options.ip)
    print(f"App is listening on {options.ip}:{options.port} serving from {base_dir}...")
    tornado.ioloop.IOLoop.current().start()
