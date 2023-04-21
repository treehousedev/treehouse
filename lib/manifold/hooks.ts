import { Node } from "./mod.ts";

// triggered on parent set or import (if has parent), or addcomponent
export interface AttachListener {
  onAttach(node: Node): void;
}

// called on accessing children
export interface ChildProvider {
  objectChildren(node: Node, children: Node[]): Node[];
}

export function hasHook(node: Node, hook: string): boolean {
  return node.value && node.value[hook] instanceof Function;
}

export function triggerHook(node: Node, hook: string, ...args: any[]): any {
  if (hasHook(node, hook)) {
    return node.value[hook].apply(node.value, args);
  }
}

export function objectHas(obj: Node, hook: string): boolean {
  for (const com of obj.components) {
    if (hasHook(com, hook)) return true;
  }
  return false;
}

export function objectCall(obj: Node, hook: string, ...args: any[]): any {
  for (const com of obj.components) {
    if (hasHook(com, hook)) {
      return com.value[hook].apply(com.value, args);
    }
  }
}