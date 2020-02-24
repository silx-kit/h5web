export interface RawDataset {
  label: string;
  children?: string[];
}

export interface RawData {
  apiVersion: string;
  datasets: {
    [id: string]: RawDataset;
  };
}

export interface TreeElement {
  name: string;
  children?: number[];
  id: number;
  parent: number | null;
}

interface TreeData {
  name: string;
  children?: TreeData[];
}

export function hdf5ToTree(rawData: RawData, id: string): TreeData {
  const { label, children } = rawData.datasets[id];
  return {
    name: label,
    children: children?.map(childId => hdf5ToTree(rawData, childId)),
  };
}
