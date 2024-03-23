export type ActionType =
  | { type: "initial" }
  | { type: "increment" }
  | { type: "decrement" };

export const id = "counter-store";

export const reducer = (
  state = 0,
  action: ActionType = { type: "initial" },
) => {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    default:
      return state;
  }
};

let state = reducer(0);
// state = 0
state = reducer(state, { type: "increment" });
// state = 1
console.log(state);
