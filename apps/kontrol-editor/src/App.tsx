import {
  OutPortal,
  InPortal,
  createHtmlPortalNode,
  HtmlPortalNode,
} from "react-reverse-portal";
import {
  Fragment,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Panel,
  PanelGroup,
  PanelProps,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  $node,
  Group,
  LayoutTree,
  Node,
  SerializedTree,
} from "@kontrol/layout-tree";
import {useWindowEvent} from "./use-window-event";
import "./panel.css";
import "./cmdk.css";

import {Command} from "cmdk";

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

const TabPageContext = createContext<TabPageContextValue | null>(null);

const useTabPageContext = () => {
  const value = useContext(TabPageContext);
  if (value === null) {
    throw new Error("useTabPageContext must be used within a TabPageContext");
  }
  return value;
};

interface TabPageContextValue {
  state: SerializedTree<NodeValue>;
  tree: LayoutTree<NodeValue>;
  bufferRegistry: BufferPortalRegistry;
}

class BufferPortalRegistry {
  private registry = new Map<string, HtmlPortalNode>();

  register(id: string, element: HtmlPortalNode) {
    this.registry.set(id, element);
  }
  unregister(id: string) {
    this.registry.delete(id);
  }
  get(id: string) {
    const element = this.registry.get(id);
    if (!element) {
      throw new Error("Element not found");
    }
    return element;
  }

  mapBuffers<T>(fn: (id: string, element: HtmlPortalNode) => T) {
    return Array.from(this.registry.entries()).map(([id, element]) =>
      fn(id, element),
    );
  }
}

const CommandMenu = () => {
  const {bufferRegistry, tree} = useTabPageContext();
  const [open, setOpen] = useState(false);

  useWindowEvent("keydown", (e) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
  });

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="kontrol">
      <Command.Input />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Switch to buffer">
          {bufferRegistry.mapBuffers((id) => (
            <Command.Item
              key={id}
              onSelect={() => {
                tree.setValue(id);
                setOpen(false);
              }}
            >
              {id}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Commands">
          <Command.Item
            onSelect={() => {
              tree.split("horizontal");
              setOpen(false);
            }}
          >
            Split horizontally
          </Command.Item>
          <Command.Item
            onSelect={() => {
              tree.split("vertical");
              setOpen(false);
            }}
          >
            Split vertically
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
};

const EmptyBuffer = () => {
  const {bufferRegistry} = useTabPageContext();

  return <InPortal node={bufferRegistry.get("empty")}>foo buffer</InPortal>;
};

const CFIBuffer = () => {
  const {bufferRegistry} = useTabPageContext();

  return <InPortal node={bufferRegistry.get("cfi")}>cfi buffer</InPortal>;
};

function TabPage(props: PropsWithChildren) {
  const tree = useMemo(() => new LayoutTree<NodeValue>("empty"), []);
  const bufferRegistry = useMemo(() => {
    const registry = new BufferPortalRegistry();
    registry.register("empty", createHtmlPortalNode());
    registry.register("cfi", createHtmlPortalNode());
    return registry;
  }, []);

  const snapshot = useSyncExternalStore(
    (handler) => {
      tree.on("change", handler);
      return () => void tree.off("change", handler);
    },
    () => tree.getSnapshot(),
  );

  const value = useMemo<TabPageContextValue>(
    () => ({tree, state: snapshot, bufferRegistry}),
    [snapshot],
  );

  return (
    <TabPageContext.Provider value={value}>
      <EmptyBuffer />
      <CFIBuffer />
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
    <PanelGroup className="flex" direction={DOrientation[group.orientation]}>
      {group.children.map((child, index) => {
        const hasBefore = index > 0;

        if ("children" in child) {
          return (
            <Fragment key={index.toString()}>
              {hasBefore && (
                <ResizeHandle
                  className={
                    group.orientation === "horizontal"
                      ? "HorizontalIcon"
                      : "VerticalIcon"
                  }
                  id={child.id + "_before"}
                />
              )}
              <StyledPanel id={index.toString()} order={index}>
                <Split group={child} />
              </StyledPanel>
            </Fragment>
          );
        }

        return (
          <Fragment key={index.toString()}>
            {hasBefore && (
              <ResizeHandle
                className={
                  group.orientation === "horizontal"
                    ? "HorizontalIcon"
                    : "VerticalIcon"
                }
                id={child.id + "_before"}
              />
            )}
            <Window order={index} node={child} />
          </Fragment>
        );
      })}
    </PanelGroup>
  );
}

function StyledPanel(props: PanelProps) {
  return <Panel className="flex flex-1" {...props} />;
}

function Window({
  node,
  order,
  style,
  defaultSize,
}: {
  style?: PanelProps["style"];
  order: number;
  node: Node<NodeValue>;
  defaultSize?: number;
}) {
  const {bufferRegistry} = useTabPageContext();

  return (
    <StyledPanel
      defaultSize={defaultSize}
      id={order.toString()}
      order={order}
      style={style}
    >
      <div className="bg-slate-800 flex flex-1">
        <OutPortal node={bufferRegistry.get(node.value)} />
      </div>
    </StyledPanel>
  );
}

function ResizeHandle({className = "", id}: {className?: string; id?: string}) {
  return (
    <PanelResizeHandle className={["ResizeHandleOuter"].join(" ")} id={id}>
      <div className="ResizeHandleInner">
        <svg className={"ResizeIcon " + className} viewBox="0 0 24 24">
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
  const {state, tree, bufferRegistry} = useTabPageContext();

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
      tree.split("horizontal");
    } else if (event.key === "|") {
      tree.split("vertical");
    }
  });

  return (
    <div className="flex flex-col box-border w-full h-full bg-slate-300 p-10">
      <div>
        <h3>focused: {tree.focused.id}</h3>
        <div className="flex gap-2 items-center mb-5">
          <Button onClick={() => tree.split("vertical")}>|</Button>
          <Button onClick={() => tree.split("horizontal")}>-</Button>
          <Button onClick={() => tree.remove()}>x</Button>
          <Button onClick={() => tree.moveFocus("left")}>left</Button>
          <Button onClick={() => tree.moveFocus("right")}>right</Button>
          <Button onClick={() => tree.moveFocus("up")}>up</Button>
          <Button onClick={() => tree.moveFocus("down")}>down</Button>|
          {bufferRegistry.mapBuffers((id) => (
            <Button key={id} onClick={() => tree.setValue(id)}>
              {id}
            </Button>
          ))}
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
      <CommandMenu />
      <Content />
    </TabPage>
  );
}

export default App;
