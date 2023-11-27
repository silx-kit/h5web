import type { Filter } from '@h5web/shared/models-hdf5';

interface Props {
  filters: Filter[];
}

function FiltersInfo(props: Props) {
  const { filters } = props;

  return (
    <>
      {filters.map((filter) => {
        const { name, id } = filter;

        return (
          <tr key={id}>
            <th scope="row">{id}</th>
            <td>{name}</td>
          </tr>
        );
      })}
    </>
  );
}

export default FiltersInfo;
