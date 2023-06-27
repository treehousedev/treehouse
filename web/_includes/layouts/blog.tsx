export const title = "Blog";
export const active = "blog";
export const heading = "Branching Out";
export const subheading = "Notes from the Treehouse";
export const layout = "layouts/default.tsx";

export default ({title, author, date, children, comp}, filters) => (
<section>
  <div class="row justify-center items-start" style="gap: var(--16);">
    <article style="width: 768px;">
      <h1>{title}</h1>
      <div class="author">{author}</div>
      <div class="date">{new Date(date).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"})}</div>
      {children}
    </article>
    <nav class="md:hidden" style="width: 256px;">
      <h5>More Blog Posts</h5>
      <div dangerouslySetInnerHTML={{"__html": comp.latest() }} />
      {/*index("/blog").reverse().map(p => 
        <div>
          <a href={p.path}>{p.attrs.title}</a>
          <div class="date">{new Date(p.attrs.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</div>
        </div>
      )*/}
    </nav>
  </div>
</section>
);