export const title = "Docs";
export const active = "docs";
export const heading = "Documentation";
export const layout = "layouts/docs.tsx";
export default (data, filters) => {
  const url = data.url;
  const nav = data.nav;
  const menu = nav.menu(url);
  const children = menu.children || [];
  return children.map(child => <div dangerouslySetInnerHTML={{"__html": filters.md(child.data.content) }} />);
}