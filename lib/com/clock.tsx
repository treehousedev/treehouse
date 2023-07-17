import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";
import { Workbench, Context } from "../workbench/mod.ts";

@component
export class Clock {
  startedAt?: Date;
  log: Date[][];
  showLog: boolean;

  component?: Node;
  object?: Node;

  constructor() {
    this.log = [];
    this.showLog = false;
  }

  onAttach(node: Node) {
    this.component = node;
    this.object = node.parent;
  }


  fromJSON(obj: any) {
    if (obj.startedAt) {
      this.startedAt = new Date(obj.startedAt);
    }
    this.log = (obj.log||[]).map(entry => [new Date(entry[0]), new Date(entry[1])]);
    this.showLog = obj.showLog;
  }

  toJSON(key: string): any {
    return {
      startedAt: this.startedAt, 
      log: this.log,
      showLog: this.showLog
    };
  }

  localTotal(): number {
    return this.log.map(this.entryDuration).reduce((acc, val) => acc+val, 0);
  }

  grandTotal(): number {
    let total = this.localTotal();
    if (this.object) {
      this.object.children.forEach(child => {
        if (child.hasComponent(Clock)) {
          total += child.getComponent(Clock).grandTotal();
        }
      });
    }
    return total;
  }

  start() {
    if (this.startedAt) return;
    this.startedAt = new Date();
  }

  stop() {
    if (!this.startedAt) return;
    let now = new Date();
    let diff = now.getTime() - this.startedAt.getTime();
    if (diff/1000 >= 60) {
      // only log if more than a minute
      this.log.push([this.startedAt, now]);
    }
    this.startedAt = undefined;
  }

  formatEntry(entry: Date[]): string {
    if (entry.length !== 2) return "";
    return `${this.formatDate(entry[0])} - ${new Intl.DateTimeFormat("en", {
      timeStyle: "short",
    }).format(entry[1])}`;
  }

  // duration in seconds
  entryDuration(entry: Date[]): number {
    const a = entry[0];
    const b = entry[1] || new Date();
    return (b.getTime() - a.getTime()) / 1000;
  }

  formatDate(d?: Date): string {
    if (!d) {
      return "";
    }
    return new Intl.DateTimeFormat("en", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  }

  formatDuration(seconds: number): string {
    let dur = seconds / 60;
    let min = Math.floor(dur % 60);
    dur = dur / 60;
    let hrs = Math.floor(dur % 60);
    return `${hrs}:${min.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}`;
  }

  afterEditor() {
    return ClockBadge;
  }

  belowEditor() {
    return ClockLog;
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "stop-clock",
      title: "Stop clock",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        return true;
      },
      action: (ctx: Context) => {
        if (!ctx.node.hasComponent(Clock)) {
          const clock = new Clock();
          ctx.node.addComponent(clock);
        }
        ctx.node.getComponent(Clock).stop();
        ctx.node.changed();
      }
    });
    workbench.keybindings.registerBinding({command: "stop-clock", key: "meta+o" });
    workbench.commands.registerCommand({
      id: "start-clock",
      title: "Start clock",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        return true;
      },
      action: (ctx: Context) => {
        if (!ctx.node.hasComponent(Clock)) {
          const clock = new Clock();
          ctx.node.addComponent(clock);
        }
        ctx.node.getComponent(Clock).start();
        ctx.node.changed();
      }
    });
    workbench.keybindings.registerBinding({command: "start-clock", key: "meta+i" });
    workbench.commands.registerCommand({
      id: "remove-clock",
      title: "Remove clock",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        if (ctx.node.hasComponent(Clock)) return true;
        return false;
      },
      action: (ctx: Context) => {
        ctx.node.removeComponent(Clock);
      }
    });
  }
}

const ClockBadge = {
  view({attrs: {node}}) {
    const clock = node.getComponent(Clock);
    const toggleLog = () => {
      clock.showLog = !clock.showLog;
      node.changed();
    }
    if (!clock.showLog && clock.startedAt) {
      return (
        <div tabindex="1" onclick={toggleLog} class="badge flex flex-row items-center" style={{background: "green", lineHeight: "var(--body-line-height)", paddingLeft: "0.25rem", paddingRight: "0.25rem", borderRadius: "4px", color: "white"}}>
          <svg class="blink" style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <div>{clock.formatDuration(clock.entryDuration([clock.startedAt]))}</div>
        </div>
      )
    }
    return (
      <div tabindex="1" onclick={toggleLog} class="badge flex flex-row items-center" style={{background: "gray", lineHeight: "var(--body-line-height)", paddingLeft: "0.25rem", paddingRight: "0.25rem", borderRadius: "4px", color: "white"}}>
        <svg style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <div>{clock.formatDuration(clock.grandTotal())}</div>
      </div>
    )
  }
}

const ClockLog = {
  view({attrs: {node}}) {
    const clock = node.getComponent(Clock);
    if (!clock.showLog) return;
    return (
      <div class="expanded-node flex flex-row">
        <div class="indent flex"></div>
        <div class="grow">
          {clock.startedAt &&
            <div class="flex flex-row" style={{marginBottom: "2px"}}>
              <div class="grow">{clock.formatDate(clock.startedAt)} - ...</div>
              <div class="flex flex-row items-center" style={{background: "green", lineHeight: "var(--body-line-height)", paddingLeft: "0.25rem", paddingRight: "0.25rem", borderRadius: "4px", color: "white"}}>
                <svg class="blink" style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <div>{clock.formatDuration(clock.entryDuration([clock.startedAt]))}</div>
              </div>
            </div>
          }
          {clock.log.toReversed().map(entry => (
            <div class="flex flex-row" style={{marginBottom: "2px"}}>
              <div class="grow">{clock.formatEntry(entry)}</div>
              <div class="flex flex-row items-center" style={{background: "#aaa", lineHeight: "var(--body-line-height)", paddingLeft: "0.25rem", paddingRight: "0.25rem", borderRadius: "4px", color: "white"}}>
                <svg style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <div>{clock.formatDuration(clock.entryDuration(entry))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
