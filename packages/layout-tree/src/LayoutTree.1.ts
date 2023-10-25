import {EventEmitter} from "eventemitter3";
import {immerable, produce} from "immer";
import {
  tid,
  Node,
  Group,
  node,
  Orientation,
  group,
  SerializedTree,
  isNode,
  serializeTree,
  flatten,
} from "./LayoutTree";

export class LayoutTree<T> extends EventEmitter {
  [immerable] = true;

  id = tid();
  root: Node<T> | Group<T> = node(null) as Node<T>;
  focused = this.root;

  split(orientation: Orientation) {
    const focused = this.focused as Node<T>;
    const clone = node(focused.value);
    const siblings = [focused, clone];

    const tree = produce(this, (draft) => {
      if (focused === draft.root) {
        draft.root = group(orientation, siblings);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- selected is not root
        const parent = focused.parent!;
        const index = parent.children.indexOf(focused);

        const newChildren =
          // if parent is not the same orientation as the new group, create a new group
          parent.orientation !== orientation
            ? [group(orientation, siblings)]
            : siblings;

        // attach the new group to the parent
        parent.children.splice(index, 1, ...newChildren);
      }
    });

    this.setFocused(clone);
    return clone;
  }

  setFocused(next: Node<T>) {
    this.focused = next;
    this.emitChange();
  }

  emitChange() {
    this.emit("change", this.toJSON());
  }

  toJSON(): SerializedTree<T> {
    const root = isNode(this.root)
      ? group("horizontal", [this.root])
      : this.root;
    return serializeTree(root);
  }

  flatten(): T[] {
    const result = flatten(this.toJSON());
    return Array.isArray(result) ? (result.flat(10) as T[]) : [result];
  }
}
