export const title = "Docs";
export const active = "docs";
export const heading = "Documentation";
export const layout = "layouts/default.tsx";
export default ({toc, url, children, comp}) => (
<section>
  <div class="row justify-center items-start sm:stack" style="gap: var(--16);">
    <nav style="flex: none; min-width: 256px;">
      <h5><a href="/docs/quickstart">Quickstart</a></h5>
      {(url==="/docs/quickstart/") && <div dangerouslySetInnerHTML={{"__html": comp.toc({toc}) }} />}
      <h5><a href="/docs/user">User Guide</a></h5>
      {(url==="/docs/user/") && <div dangerouslySetInnerHTML={{"__html": comp.toc({toc}) }} />}
      <h5><a href="/docs/dev">Developer Guide</a></h5>
      {(url==="/docs/dev/") && <div dangerouslySetInnerHTML={{"__html": comp.toc({toc}) }} />}
      <h5><a href="/docs/project">Project Guide</a></h5>
      {(url==="/docs/project/") && <div dangerouslySetInnerHTML={{"__html": comp.toc({toc}) }} />}
    </nav>
    <article class="grow">
      {children}
    </article>
  </div>
</section>
)