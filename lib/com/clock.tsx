import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Clock {
  startedAt: Date;

  fromJSON(obj: any) {
    this.startedAt = Date.parse(obj.startedAt);
  }
}