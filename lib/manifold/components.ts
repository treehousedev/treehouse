

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
  return Object.create(getComponent(com).prototype, Object.getOwnPropertyDescriptors(obj));
}