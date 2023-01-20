import {HelloWorld} from "../outline/mod.tsx";

export const App: m.Component = {
  view (vnode) {
    return <HelloWorld name={"Hi!!!"} count={666} />;
  }
};