import React from 'react';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import TreeNodeIcon from './TreeNodeIcon';

const data = flattenTree({
  name: '',
  children: [
    {
      name: 'entry_0000',
      children: [
        {
          name: '0_measurement',
          children: [
            { name: 'diode' },
            { name: 'images' },
            { name: 'ring_curent' },
            { name: 'timestamps' },
          ],
        },
        {
          name: '1_integration',
          children: [
            { name: 'configuration' },
            { name: 'date' },
            { name: 'value' },
          ],
        },
        { name: 'program_name' },
        { name: 'start_time' },
        { name: 'title' },
      ],
    },
    {
      name: 'entry_0001',
      children: [{ name: 'program_name' }],
    },
    {
      name: 'entry_0002',
      children: [{ name: 'program_name' }],
    },
  ],
});

function Browser(): JSX.Element {
  return (
    <div className="browser">
      <p className="browser__filename">water_224.h5</p>

      <TreeView
        data={data}
        nodeRenderer={({ element, getNodeProps, isBranch, isExpanded }) => (
          <div {...getNodeProps()}>
            {<TreeNodeIcon isBranch={isBranch} isExpanded={isExpanded} />}{' '}
            {element.name}
          </div>
        )}
      />
    </div>
  );
}

export default Browser;
