import {EventEmitter} from "eventemitter3";

type ID<T extends string> = `${T}_${string}`;

const idFactory = <T extends string>(type: T) => {
  let counter = 0;
  return (maybeID?: string): ID<T> => {
    return `${type}_${maybeID ?? counter++}` as ID<T>;
  };
};

const tid = idFactory("tree");
const gid = idFactory("group");
const nid = idFactory("node");

type Orientation = "vertical" | "horizontal";

export interface Node<T> {
  id: ID<"node">;
  value: T;

  parent?: Group<T>;
}

interface WithID<T extends string = string> {
  id: ID<T>;
}

export interface Group<T> {
  id: ID<"group">;
  orientation: Orientation;

  parent?: Group<T>;
  children: (Node<T> | Group<T>)[];
}

export const $node = <T>(value: T): Node<T> => {
  return {id: nid(), value};
};

function isNode<T extends Node<unknown> = Node<unknown>>(
  value: WithID,
): value is T {
  return value.id.startsWith("node");
}

const group = <T>(
  orientation: Orientation,
  children: Group<T>["children"],
  overrides: Partial<Group<T>> = {},
): Group<T> => {
  const g: Partial<Group<T>> = {
    id: overrides.id ?? gid(),
    orientation,
  };

  g.children = children.map((child) => {
    child.parent = g as Group<T>;
    return child;
  });

  return g as Group<T>;
};

const getFirstChild = <T>(parent: Group<T>): Node<T> => {
  if (!parent.children.length) {
    throw new Error("Group has no children");
  }

  if (isNode(parent.children[0])) {
    return parent.children[0];
  }

  return getFirstChild(parent.children[0]);
};

export class LayoutTree<T> extends EventEmitter {
  id = tid();
  groups = new Map<ID<"group">, Group<T>>();
  nodes = new Map<ID<"node">, Node<T>>();

  root: Node<T> | Group<T>;
  _cached: SerializedTree<T>;
  focused: Node<T>;

  constructor(value: T) {
    super();
    this.root = this.$node(value);
    this._cached = serializeTree(this.root);
    this.focused = isNode(this.root) ? this.root : getFirstChild(this.root);
  }

  $node(value: T) {
    const newNode = $node(value);
    this.nodes.set(newNode.id, newNode);
    return newNode;
  }

  $group(
    orientation: Orientation,
    children: Group<T>["children"],
    overrides?: Partial<Group<T>>,
  ) {
    const newGroup = group(orientation, children, overrides);
    this.groups.set(newGroup.id, newGroup);
    return newGroup;
  }

  split(orientation: Orientation, value?: T) {
    const focused = this.focused;
    const clone = this.$node(value ?? focused.value);

    if (focused === this.root) {
      this.root = this.$group(orientation, [focused, clone]);
    } else {
      if (!focused.parent) throw new Error("Node has no parent");

      const parent = focused.parent;

      const newChildren =
        // if parent is not the same orientation as the new group, create a new group
        parent.orientation !== orientation
          ? [this.$group(orientation, [focused, clone])]
          : [focused, clone];

      const index = parent.children.indexOf(focused);
      // attach the new group to the parent
      parent.children.splice(index, 1, ...newChildren);

      // set the parent of the new group
      newChildren.forEach((child) => {
        child.parent = parent;
      });
    }

    this.setFocused(clone);
    return clone;
  }

  remove() {
    const focused = this.focused;
    // if focused is root, do nothing
    if (focused === this.root) return;

    const parent = focused.parent;
    // if focused has no parent, do nothing
    if (!parent) throw new Error("Node has no parent");

    const index = parent.children.indexOf(focused);

    parent.children.splice(index, 1);

    // if parent has only one child, replace parent with child
    if (parent.children.length === 1) {
      // if parent is root, replace root with child
      if (!parent.parent) {
        this.root = parent.children[0];
        this.setFocused(this.root as Node<T>);
        return;
      }
      const parentIndex = parent.parent.children.indexOf(parent);
      parent.parent.children[parentIndex] = parent.children[0];
      parent.children[0].parent = parent.parent;
      this.setFocused(parent.children[0] as Node<T>);
      return;
    }

    this.setFocused(
      parent.children[clamp(index, 0, parent.children.length - 1)] as Node<T>,
    );
  }

  setFocused(candidate: Node<T> | SerializedNode<T>) {
    const cached = this.nodes.get(candidate.id);
    if (!cached) throw new Error("Node not found");

    this.focused = cached;
    this.emitChange();
  }

  setValue(value: T) {
    const focused = this.focused;
    focused.value = value;
    this.emitChange();
  }

  moveFocus(direction: Direction) {
    const focused = this.focused;
    const sibling = findSibling(focused, direction);
    if (!sibling) return;
    this.setFocused(sibling);
  }

  emitChange() {
    this.cacheSnapshot();
    this.emit("change");
  }

  getSnapshot() {
    return this._cached;
  }

  cacheSnapshot() {
    this._cached = serializeTree(this.root);
  }
}

export interface SerializedNode<T> {
  id: ID<"node">;
  value: T;
}

export interface SerializedGroup<T> {
  id: ID<"group">;
  orientation: Orientation;
  children: SerializedTree<T>[];
}

export type SerializedTree<T> = SerializedNode<T> | SerializedGroup<T>;

function serializeTree<T>(root: Node<T> | Group<T>): SerializedTree<T> {
  if (isNode(root)) {
    return {id: root.id, value: root.value};
  }

  return {
    id: root.id,
    orientation: root.orientation,
    children: root.children.map(serializeTree),
  } as SerializedGroup<T>;
}

type Direction = "up" | "down" | "left" | "right";

const findSibling = <T = unknown>(
  current: Node<T> | Group<T>,
  direction: Direction,
  relativeIndex?: number,
  initialNode = current,
): Node<T> | null => {
  const orientation = getOrientation(direction);
  const parentWithOrientation = findParentWithOrientation(current, orientation);

  if (!parentWithOrientation) return initialNode as Node<T>;

  if (parentWithOrientation !== current.parent) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- bs
    const parent = current.parent!;
    return findSibling(parent, direction, undefined, initialNode);
  }

  const childIndex = parentWithOrientation.children.indexOf(current);
  const childrenLength = parentWithOrientation.children.length;
  const newIndex = getSiblingIndex(direction, childIndex);

  if (newIndex < 0 || newIndex > childrenLength - 1) {
    return isRoot(parentWithOrientation)
      ? (initialNode as Node<T>)
      : findSibling(
          parentWithOrientation,
          direction,
          relativeIndex,
          initialNode,
        );
  }

  // const newRelativeIndex = relativeIndex ?? childIndex + 1 / childrenLength;

  return findChild(
    parentWithOrientation,
    orientation,
    direction,
    newIndex,
    relativeIndex ?? childIndex + 1 / childrenLength,
  );
};

const findParentWithOrientation = <T>(
  leaf: Node<T> | Group<T>,
  orientation: Orientation,
): Group<T> | null => {
  if (!leaf.parent) return null;

  if (leaf.parent.orientation === orientation) {
    return leaf.parent;
  }

  return findParentWithOrientation(leaf.parent, orientation);
};

const findChild = <T>(
  parent: Group<T>,
  orientation: Orientation,
  direction: Direction,
  index: number,
  relativeIndex = 0,
): Node<T> | null => {
  const children = parent.children;
  const child = children[clamp(index, 0, children.length - 1)];

  // we found the child we are looking for
  if (isLeaf(child)) return child;

  let childIndex: number;
  if (child.orientation === orientation) {
    childIndex = isGoingBack(direction) ? children.length - 1 : 0;
  } else {
    childIndex = Math.round(relativeIndex * children.length);
  }

  return findChild(child, orientation, direction, childIndex, relativeIndex);
};

const isRoot = (child: Node<unknown> | Group<unknown>) => !child.parent;

const isLeaf = <T>(child: Node<T> | Group<T>): child is Node<T> =>
  child.id.startsWith("node");

const isGoingBack = (direction: Direction) =>
  ["left", "up"].includes(direction);

const clamp = (num: number, lower: number, upper: number) =>
  Math.min(Math.max(lower, num), upper);

const getOrientation = (direction: Direction) =>
  ["up", "down"].includes(direction) ? "horizontal" : "vertical";

const getSiblingIndex = (direction: Direction, index: number) =>
  isGoingBack(direction) ? index - 1 : index + 1;
