export interface TreeNode<T> {
  uid: string;
  label: string;
  level: number;
  data: T;
  children?: TreeNode<T>[];
}
