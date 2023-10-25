# `@kontrol/layout-tree`

A data structure to track windows of a tab.

## Example

```ts
import { createTree } from "@kontrol/layout-tree";

// this gives you an empty tree
// think of it as opening an empty tab using vim
const tree = createTree("0");
tree.toJSON(); // [0]

tree.split(0, "vertical");
tree.toJSON(); // [0, 0]

tree.split(1, "horizontal");
tree.toJSON(); // [0, [1, 2]]

tree.split(1, "horizontal");
tree.toJSON(); // [0, [1, 2, 3]]
```
