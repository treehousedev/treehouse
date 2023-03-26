import {m,index} from "../deps.ts";
import layout from "./default.tsx";
export default {view: ({attrs, children}) => m(layout, Object.assign({
  active: "blog",
  title: "Blog", 
  heading: "Branching Out", 
  subheading: "Notes from the Treehouse"
}, attrs),
<section>
  <div class="row justify-center items-start" style="gap: var(--16);">
    <article style="width: 768px;">
      <h1>{attrs.title}</h1>
      <div class="author">{attrs.author}</div>
      <div class="date">{new Date(attrs.date).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"})}</div>
      {children}
    </article>
    <nav class="md:hidden" style="width: 256px;">
      <h5>More Blog Posts</h5>
      {index("/blog").reverse().map(p => 
        <div>
          <a href={p.path}>{p.attrs.title}</a>
          <div class="date">{new Date(p.attrs.date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</div>
        </div>
      )}
    </nav>
  </div>
</section>
)}