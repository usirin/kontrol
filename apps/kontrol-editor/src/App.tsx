import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Panel,
  PanelGroup,
  PanelProps,
  PanelResizeHandle,
} from "react-resizable-panels";
import {Group, LayoutTree, Node, SerializedTree} from "@kontrol/layout-tree";
import {useWindowEvent} from "./use-window-event";

type NodeValue = string;

const Button = ({
  children,
  onClick,
}: PropsWithChildren<{onClick: () => void}>) => (
  <button
    className="px-4 py-2 bg-slate-700 text-slate-50 rounded"
    onClick={onClick}
  >
    {children}
  </button>
);

interface TabPageContextValue {
  state: SerializedTree<NodeValue>;
  tree: LayoutTree<NodeValue>;
}

const TabPageContext = createContext<TabPageContextValue | null>(null);

const useTabPageContext = () => {
  const value = useContext(TabPageContext);
  if (value === null) {
    throw new Error("useTabPageContext must be used within a TabPageContext");
  }
  return value;
};

function TabPage(props: PropsWithChildren) {
  const tree = useMemo(() => new LayoutTree<NodeValue>(), []);
  const [state, setState] = useState(tree.toJSON());

  useLayoutEffect(() => {
    const handler = () => {
      const json = tree.toJSON();
      console.log(JSON.stringify(json, null, 2));
      setState(json);
    };
    tree.on("change", handler);
    () => void tree.off("change", handler);
  }, []);

  const value = useMemo<TabPageContextValue>(() => ({tree, state}), [state]);

  return (
    <TabPageContext.Provider value={value}>
      {props.children}
    </TabPageContext.Provider>
  );
}

const DOrientation = {
  horizontal: "vertical",
  vertical: "horizontal",
} as const;

function Split({group}: {group: Group<NodeValue>}) {
  return (
    <PanelGroup
      className="flex gap-2"
      direction={DOrientation[group.orientation]}
    >
      {group.id}
      {group.children.map((child, index) => {
        if ("children" in child) {
          return (
            <StyledPanel
              key={child.id}
              id={child.id}
              order={index}
              style={{flexGrow: 1}}
            >
              <Split group={child} />
            </StyledPanel>
          );
        }
        return (
          <Window
            style={{
              flexDirection:
                group.orientation === "horizontal" ? "column" : "row",
              flexGrow: 1,
            }}
            order={index}
            key={child.id}
            node={child}
          />
        );
      })}
    </PanelGroup>
  );
}

function StyledPanel(props: PanelProps) {
  return <Panel className="flex" {...props} />;
}

function Window({
  node,
  order,
  style,
}: {
  style?: PanelProps["style"];
  order: number;
  node: Node<NodeValue>;
}) {
  const {tree} = useTabPageContext();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (tree.focused.id === node.id) {
      ref.current?.focus();
    }
  }, [tree.focused]);

  return (
    <StyledPanel id={node.id} order={order} className={`flex`} style={style}>
      <button
        ref={ref}
        className={`flex flex-1 items-center justify-center text-slate-300 ${
          tree.focused.id === node.id ? "bg-slate-500" : "bg-slate-800"
        }`}
        onClick={() => {
          tree.setFocused(node);
        }}
      >
        {node.id}
      </button>
    </StyledPanel>
  );
}

function ResizeHandle({className = "", id}: {className?: string; id?: string}) {
  return (
    <PanelResizeHandle
      className={[
        "flex-[0 0 1.5em] relative outline-none bg-transparent",
        className,
      ].join(" ")}
      id={id}
    >
      <div className="absolute top-1 left-1 right-1 bottom-1 rounded-md bg-slate-500 transition">
        <svg
          className="w-1 h-1 absolute left-[calc(50%-0.5rem)] top-[calc(50%-0.5rem)]"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M8,18H11V15H2V13H22V15H13V18H16L12,22L8,18M12,2L8,6H11V9H2V11H22V9H13V6H16L12,2Z"
          />
        </svg>
      </div>
    </PanelResizeHandle>
  );
}

function Content() {
  const {state, tree} = useTabPageContext();

  useWindowEvent("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      tree.moveFocus("left");
    } else if (event.key === "ArrowRight") {
      tree.moveFocus("right");
    } else if (event.key === "ArrowUp") {
      tree.moveFocus("up");
    } else if (event.key === "ArrowDown") {
      tree.moveFocus("down");
    } else if (event.key === "-") {
      tree.split("horizontal", "hs_" + Date.now());
    } else if (event.key === "|") {
      tree.split("vertical", "vs_" + Date.now());
    }
  });

  return (
    <div className="flex flex-col box-border w-full h-full bg-slate-300 p-10">
      <div>
        <h3>focused: {tree.focused.id}</h3>
        <div className="flex gap-2 items-center mb-5">
          <Button onClick={() => tree.split("vertical", "vs_" + Date.now())}>
            |
          </Button>
          <Button onClick={() => tree.split("horizontal", "hs_" + Date.now())}>
            -
          </Button>
          <Button onClick={() => tree.moveFocus("left")}>left</Button>
          <Button onClick={() => tree.moveFocus("right")}>right</Button>
          <Button onClick={() => tree.moveFocus("up")}>up</Button>
          <Button onClick={() => tree.moveFocus("down")}>down</Button>
        </div>
      </div>
      <div className="bg-slate-950 h-full text-green-500 box-border p-2">
        {"children" in state ? (
          <Split group={state} />
        ) : (
          <PanelGroup id="root" direction="horizontal">
            <Window order={0} node={state} />
          </PanelGroup>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <TabPage>
      <Content />
    </TabPage>
  );
}

export default App;
