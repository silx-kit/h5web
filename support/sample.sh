#!/bin/bash

echo -e "Creating sample HDF5 file with h5py...\n"

if pipenv run create_sample; then
  echo -e "\nSample file created!"
else
  echo -e "\nUnable to create sample file."
  echo -e "Downloading from silx.org instead...\n"

  pipenv run download_sample
  echo -e "\nSample file downloaded!"
fi
