#!/usr/bin/env python
# coding: utf-8
"""FastAPI-based server sample code"""

import argparse
import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Disable libhdf5 file locking since h5grove is only reading files
# This needs to be done before any import of h5py, so before h5grove import
os.environ["HDF5_USE_FILE_LOCKING"] = "FALSE"

from h5grove.fastapi_utils import router, settings  # noqa


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


app = FastAPI()
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    parser = parser_fn()
    options = parser.parse_args()

    settings.base_dir = options.basedir

    uvicorn.run("fastapi_app:app", host=options.ip, port=options.port, log_level="info")
