/**
 * Components are classes that can be used for component values in component nodes.
 * These classes need to be registered so they can be properly "hydrated" from 
 * marshaled form (usually JSON) back into class instances.
 * 
 * @module
 */

const registry: Record<string, any> = {};

export function component(target: any) {
  const stack = new Error().stack;
  if (stack) {
    const line = stack.split('\n')[3];
    const name = line.split("/").pop()?.split(".")[0];
    target.__module = name;
  }

  registry[componentName(target)] = target;
}

export function componentName(target: any): string {
  if (target.constructor && target.constructor.__module) {
    target = target.constructor;
  }
  if (target.__module) {
    return `${target.__module}.${target.name}`
  }
  return target.name;
}

export function getComponent(com: any): any {
  if (typeof com === "string") {
    return registry[com];
  }
  return registry[componentName(com)];
}

export function inflateToComponent(com: any, obj: any): any {
  const o = new (getComponent(com));
  if (o["fromJSON"] instanceof Function) {
    o.fromJSON(obj);
  } else {
    Object.defineProperties(o, Object.getOwnPropertyDescriptors(obj));
  }
  return o;
}