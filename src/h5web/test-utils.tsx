import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  within,
} from '@testing-library/react';
import App from './App';
import MockProvider from './providers/mock/MockProvider';
import type { Vis } from './visualizations';
import { nanoid } from 'nanoid';
import {
  HDF5Attribute,
  HDF5Dims,
  HDF5NumericType,
  HDF5Shape,
  HDF5SimpleShape,
  HDF5Type,
  MyHDF5Dataset,
  MyHDF5Datatype,
  MyHDF5Entity,
  MyHDF5EntityKind,
  MyHDF5Group,
} from './providers/models';
import { makeSimpleShape, makeStrAttr } from './providers/mock/data';
import { NxInterpretation } from './visualizations/nexus/models';

export function renderApp(): RenderResult {
  return render(
    <MockProvider>
      <App />
    </MockProvider>
  );
}

export async function selectExplorerNode(path: string): Promise<void> {
  for await (const name of path.split('/')) {
    fireEvent.click(await screen.findByRole('treeitem', { name }));
  }
}

export function queryVisSelector(): HTMLElement | null {
  return screen.queryByRole('tablist', { name: 'Visualization' });
}

export async function findVisSelector(): Promise<HTMLElement> {
  return screen.findByRole('tablist', { name: 'Visualization' });
}

export async function findVisSelectorTabs(): Promise<HTMLElement[]> {
  return within(await findVisSelector()).getAllByRole('tab');
}

export async function selectVisTab(vis: Vis): Promise<void> {
  fireEvent.click(await screen.findByRole('tab', { name: vis }));
}

/**
 * Mock `console.error` method in test.
 * Call returned `resetConsole` function to restore original method.
 */
/* eslint-disable no-console */
export function prepareForConsoleError() {
  const original = console.error;

  const mock = jest.fn();
  console.error = mock;

  return {
    consoleErrorMock: mock,
    resetConsole: () => {
      console.error = original;
    },
  };
}
/* eslint-enable no-console */

type Opts = Partial<Pick<MyHDF5Dataset, 'id' | 'parents' | 'attributes'>>;

export function makeMyGroup(
  name: string,
  children: MyHDF5Entity[] = [],
  opts: Opts = {}
): MyHDF5Group {
  const { id = name, parents = [], attributes = [] } = opts;

  const group: MyHDF5Group = {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Group,
    parents,
    children,
    attributes,
  };

  group.parents.forEach((parent) => {
    parent.children = [...parent.children, group];
  });

  group.children.forEach((child) => {
    child.parents = [group, ...child.parents];
  });

  return group;
}

export function makeMyDataset<S extends HDF5Shape, T extends HDF5Type>(
  name: string,
  shape: S,
  type: T,
  opts: Opts = {}
): MyHDF5Dataset<S, T> {
  const { id = name, parents = [], attributes = [] } = opts;

  const dataset: MyHDF5Dataset<S, T> = {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Dataset,
    parents,
    attributes,
    shape,
    type,
  };

  dataset.parents.forEach((parent) => {
    parent.children = [...parent.children, dataset];
  });

  return dataset;
}

export function makeMySimpleDataset<T extends HDF5Type>(
  name: string,
  type: T,
  dims: HDF5Dims,
  opts: Opts = {}
): MyHDF5Dataset<HDF5SimpleShape, T> {
  return makeMyDataset(name, makeSimpleShape(dims), type, opts);
}

export function makeMyDatatype<T extends HDF5Type>(
  name: string,
  type: T,
  opts: Opts = {}
): MyHDF5Datatype<T> {
  const { id = name, parents = [], attributes = [] } = opts;

  const datatype: MyHDF5Datatype<T> = {
    uid: nanoid(),
    id,
    name,
    kind: MyHDF5EntityKind.Datatype,
    parents,
    attributes,
    type,
  };

  datatype.parents.forEach((parent) => {
    parent.children = [...parent.children, datatype];
  });

  return datatype;
}

export function withMyAttributes<T extends MyHDF5Entity>(
  entity: T,
  attributes: HDF5Attribute[]
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

export function withMyInterpretation<
  T extends MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withMyAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
}

export function makeMyNxDataGroup(
  name: string,
  signal: MyHDF5Dataset,
  opts: Opts = {}
): MyHDF5Group {
  return makeMyGroup(name, [signal], {
    ...opts,
    attributes: [
      ...(opts.attributes || []),
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', signal.name),
    ],
  });
}

export function makeMyNxDataGroupWithAxes(
  name: string,
  opts: {
    signal: MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>;
    axes: Record<string, MyHDF5Dataset<HDF5SimpleShape, HDF5NumericType>>;
    axesAttr: (keyof typeof opts.axes | '.')[];
  } & Opts
): MyHDF5Group {
  const { signal, axes, axesAttr, ...groupOpts } = opts;

  return makeMyGroup(name, [signal, ...Object.values(axes)], {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', 'NXdata'),
      makeStrAttr('signal', signal.name),
      makeStrAttr('axes', axesAttr),
    ],
  });
}

export function makeMyNxEntity(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess',
  opts: { defaultPath?: string; children?: MyHDF5Entity[] } & Opts = {}
): MyHDF5Group {
  const { defaultPath, children, ...groupOpts } = opts;

  return makeMyGroup(name, children, {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', type),
      ...(defaultPath ? [makeStrAttr('default', defaultPath)] : []),
    ],
  });
}
