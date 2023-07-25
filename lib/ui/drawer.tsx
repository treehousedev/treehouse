export const Drawer = {
  view({ attrs, children }) {
    const open = attrs.open;
    return (
      <div class={`drawer ${open ? 'open' : 'closed'}`}>
        {children}
      </div>
    )
  }
};
