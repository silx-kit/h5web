import React, { useEffect, useState } from 'react';
import TreeView, { flattenTree } from 'react-accessible-treeview';
import TreeNodeIcon from './TreeNodeIcon';
import { RawData, hdf5ToTree, TreeElement } from '../utils';

interface Props {
  rawData: RawData;
}

function Browser(props: Props): JSX.Element {
  const { rawData } = props;
  const [treeData, setTreeData] = useState<TreeElement[]>();

  useEffect(() => {
    setTreeData(flattenTree(hdf5ToTree(rawData, '/')));
  }, [rawData]);

  return (
    <div className="browser">
      <p className="browser__filename">water_224.h5</p>
      {treeData && (
        <TreeView
          data={treeData}
          nodeRenderer={({ element, getNodeProps, isBranch, isExpanded }) => (
            <div {...getNodeProps()}>
              {<TreeNodeIcon isBranch={isBranch} isExpanded={isExpanded} />}{' '}
              {element.name}
            </div>
          )}
        />
      )}
    </div>
  );
}

export default Browser;
