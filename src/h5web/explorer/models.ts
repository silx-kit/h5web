export interface TreeNode<T> {
  uid: string;
  label: string;
  data: T;
  children?: TreeNode<T>[];
  parents: T[];
}

export type ExpandedNodes = Record<string, boolean>;
