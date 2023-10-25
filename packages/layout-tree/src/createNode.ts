import type { LegacyOrientation } from "./constants";
import { Node } from "./models/Node";

interface CreateNodeArgs<T> {
  value: T;
  children?: Node<T>[];
  orientation?: LegacyOrientation;
}

let counter = 0;
const id = (initial?: string) => initial ?? `${counter++}`;

export function node<T>(value: T) {
  return createNode({ value });
}

export const group = <T>(
  orientation: "vertical" | "horizontal",
  children: Node<T>[],
) =>
  createNode({
    value: id() as T,
    children,
    orientation: orientation as LegacyOrientation,
  });

export const createNode = <T>({
  value,
  children,
  orientation,
}: CreateNodeArgs<T>) => {
  const parent = new Node<T>(value, orientation);

  if (children) {
    parent.attachChildren(children);
  }

  return parent;
};
