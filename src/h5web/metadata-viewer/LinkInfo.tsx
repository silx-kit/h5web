import type { HDF5Link } from '../providers/hdf5-models';

interface Props {
  link: HDF5Link;
}

function LinkInfo(props: Props) {
  const { link } = props;

  return (
    <>
      <tr>
        <th scope="row">Class</th>
        <td>{link.class}</td>
      </tr>
      {'collection' in link && (
        <tr>
          <th scope="row">Collection</th>
          <td>{link.collection}</td>
        </tr>
      )}
      {'id' in link && (
        <tr>
          <th scope="row">Entity ID</th>
          <td>{link.id}</td>
        </tr>
      )}
      {'file' in link && (
        <tr>
          <th scope="row">File</th>
          <td>{link.file}</td>
        </tr>
      )}
      {'h5path' in link && (
        <tr>
          <th scope="row">H5Path</th>
          <td>{link.h5path}</td>
        </tr>
      )}
    </>
  );
}

export default LinkInfo;
