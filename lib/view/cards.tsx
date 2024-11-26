import { Node } from "../model/mod.ts";
import { InlineFrame } from "../com/iframe.tsx";

function tryFields(n: Node, fields: string[]): any|null {
  for (const field of fields) {
    const value = n.componentField(field);
    if (value) {
      return value;
    }
  }
  return null;
}

export default {
  view({attrs: {workbench, path}}) {
    const node = path.node;
    return (
      <div class="cards-view flex flex-row" style={{gap: "1rem", paddingBottom: "1rem", flexWrap: "wrap"}}>
        {node.children.map(n => {
          const linkURL = tryFields(n, ["linkURL"]);
          const dateTime = tryFields(n, ["updatedAt", "createdAt"]);
          const userName = tryFields(n, ["updatedBy", "createdBy", "username"]);          
          const thumbnailURL = tryFields(n, ["thumbnailURL", "coverURL"]);
          const frame = n.getComponent(InlineFrame);
          
          let thumbnail = <img style={{
            objectFit: "fill", 
            objectPosition: "center", 
            width: "12rem", 
            height: "9rem"
          }} src={thumbnailURL} />;
          if (frame) {
            thumbnail = (
              <div style={{
                width: "120rem", 
                height: "90rem",
                transform: "scale(0.1)",
                pointerEvents: "none",
                transformOrigin: "0 0"
              }}>
                <iframe src={frame.url} style={{
                  border: "0",
                  width: "100%", 
                  height: "100%"
                }}></iframe>
              </div>
            )
          }
          return (
            <div style={{border: "1px solid gray", overflow: "hidden", borderRadius: "0.5rem", paddingBottom: "0.5rem", width: "12rem"}}>
              <div style={{position: "relative", overflow: "hidden", width: "12rem", height: "9rem"}}>
                {(linkURL)
                  ? <a href={linkURL}>{thumbnail}</a>
                  : thumbnail
                }
              </div>
              <div style={{padding: "0.5rem", paddingBottom: "0.25rem"}}>
                {(linkURL)
                  ? <a href={linkURL}>{n.name}</a>
                  : n.name}
              </div>
              {userName && <div style={{padding: "0.5rem", paddingTop: "0", paddingBottom: "0.75rem", color: "#aaa"}}>
                {userName}
              </div>}
              {dateTime && <div style={{padding: "0.5rem", paddingTop: "0", paddingBottom: "0.75rem", color: "#aaa"}}>
                {timeAgo(dateTime)}
              </div>}
            </div>
        )})}
      </div>
    )
  }
}

function timeAgo(date) {
  if (!(date instanceof Date)) {
      throw new Error("Input must be a valid Date object.");
  }
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const count = Math.floor(seconds / secondsInUnit);
      if (count > 0) {
          return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
  }

  return 'just now';
}