import React from 'react';
import TreeView from 'react-accessible-treeview';

const data = [
  { name: '', children: [1, 4, 9, 10, 11], id: 0, parent: null },
  { name: 'src', children: [2, 3], id: 1, parent: 0 },
  { name: 'index.js', id: 2, parent: 1 },
  { name: 'styles.css', id: 3, parent: 1 },
  { name: 'node_modules', children: [5, 7], id: 4, parent: 0 },
  { name: 'react-accessible-treeview', children: [6], id: 5, parent: 4 },
  { name: 'bundle.js', id: 6, parent: 5 },
  { name: 'react', children: [8], id: 7, parent: 4 },
  { name: 'bundle.js', id: 8, parent: 7 },
  { name: '.npmignore', id: 9, parent: 0 },
  { name: 'package.json', id: 10, parent: 0 },
  { name: 'webpack.config.js', id: 11, parent: 0 },
];

function Browser(): JSX.Element {
  return (
    <div className="browser">
      <TreeView
        data={data}
        nodeRenderer={({ element, getNodeProps }) => (
          <div {...getNodeProps()}>{element.name}</div>
        )}
      />
    </div>
  );
}

export default Browser;
