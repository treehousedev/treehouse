declare global {
  const MiniSearch: any;
  function m(...args: any[]): any;

  namespace m {
    type Component<Attrs = any, State = any> = any;

    const redraw: any;
    const mount: any;
  }

  interface Document {
    selection?: {
      empty(): void;
    };
  }

  interface Element {
    editor?: any;
    jarEditor?: any;
    close?(): void;
    showModal?(): void;
    focus?(): void;
  }

  interface EventTarget {
    closest?(selector: string): Element | null;
  }

  interface Window {
    CodeJar?: any;
    Editor?: any;
    MiniSearch?: any;
    backend?: {
      name: string;
      url?: string;
    };
    hljs?: any;
    registerView?: (name: string, view: any) => void;
    reloadNodes?: (nodeIDs: string[]) => void;
    workbench: any;
  }
}

export {};
