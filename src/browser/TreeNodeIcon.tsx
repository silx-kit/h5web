import React from 'react';
import { FiGrid, FiChevronRight, FiChevronDown } from 'react-icons/fi';

interface Props {
  isBranch: boolean;
  isExpanded?: boolean;
}

function TreeNodeIcon(props: Props): JSX.Element {
  const { isBranch, isExpanded } = props;

  if (!isBranch) {
    return <FiGrid className="icon" />;
  }

  return isExpanded ? (
    <FiChevronDown className="icon" />
  ) : (
    <FiChevronRight className="icon" />
  );
}

export default TreeNodeIcon;
