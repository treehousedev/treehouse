export const title = "Docs";
export const active = "docs";
export const heading = "Documentation";
export const layout = "layouts/default.tsx";
export default ({url, nav, comp, children}) => {
  const header = () => {
    if (url.includes('/docs/quickstart')) return 'Quickstart';
    if (url.includes('/docs/user')) return 'User Guide';
    if (url.includes('/docs/dev')) return 'Developer Guide';
    if (url.includes('/docs/project')) return 'Project Guide';
    return 'Documentation';
  };
  return (
    <section>
      <div class="row justify-center items-start sm:stack" style="gap: var(--16);">
        <nav style="flex: none; min-width: 256px;">
          <comp.Nav title="Quickstart" href="/docs/quickstart/" currentUrl={url} nav={nav} />
          <comp.Nav title="User Guide" href="/docs/user/" currentUrl={url} nav={nav} />
          <comp.Nav title="Developer Guide" href="/docs/dev/" currentUrl={url} nav={nav} />
          <comp.Nav title="Project Guide" href="/docs/project/" currentUrl={url} nav={nav} />
        </nav>
        <article class="grow">
          <h1>{header()}</h1>
          {children}
        </article>
      </div>
    </section>
  )
}