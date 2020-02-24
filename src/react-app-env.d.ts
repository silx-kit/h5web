/// <reference types="react-scripts" />

declare module 'react-accessible-treeview' {
  interface TreeElement {
    name: string;
    children?: number[];
    id: number;
    parent: number | null;
  }

  interface TreeViewProps {
    className?: string;
    data: TreeElement[];

    nodeRenderer: (args: {
      element: TreeElement;
      isExpanded?: boolean;
      level: number;
      isBranch: boolean;
      getNodeProps: (onClick?: Function) => object;
    }) => JSX.element;

    onSelect?: (args: {
      element: TreeElement;
      isExpanded?: boolean;
      isBranch: boolean;
    }) => void;
  }

  export const flattenTree: (obj: object) => TreeElement[];

  const TreeView: React.FunctionComponent<TreeViewProps>;
  export default TreeView;
}
