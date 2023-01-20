
interface Attrs {
  name: string;
  count: number;
}

export const HelloWorld: m.Component<Attrs> = {
  view (vnode: any) {
    return <span>name: {vnode.attrs.name}, count: {vnode.attrs.count}</span>
  }
};