export default ({ title, href, currentUrl, nav }) => {
  const menu = nav.menu(href);
  const showChildren = currentUrl.includes(href) && menu.children.length > 0;
  return (
    <>
      <h5><a href={href}>{title}</a></h5>
      {showChildren && <div><ul>{menu.children.map(child => <li><a href={child.data.url}>{child.data.title}</a></li>)}</ul></div>}
    </>
  );
}