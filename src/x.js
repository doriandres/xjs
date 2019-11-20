let virtualDomIndex = 0;
const virtualDom = [];
let currentNode = null;
class VirtualNode {
  constructor(tag) {
    this.node = tag instanceof HTMLElement ? tag : document.createElement(tag);
    this.tag = this.node.tagName.toLowerCase();
    this.props = {};
    this._children = [];
    this.virtualChildIndex = 0;
    this.hooks = [];
    this.hookIndex = 0;
  }
  set props(props) {
    this._props = props;
    Object.assign(this.node, this._props);
  }
  get props() {
    return { ...this._props };
  }
  get children() {
    return [...this._children];
  }
  setChildAt(child, index) {
    const oldChild = this._children[index];
    this._children[index] = child;

    if (this.node.children[index] === child.node) return;

    if (oldChild && oldChild !== child) {
      this.node.replaceChild(child.node, oldChild.node);
    } else {
      this.node.appendChild(child.node);
    }
  }
}
export const render = (host, factory) => {
  host.innerHTML = "";
  currentNode = new VirtualNode(host);
  factory();
};
export const hook = defaultValue => {
  let innerhook = currentNode.hooks[currentNode.hookIndex];
  if (!innerhook) {
    const parentNode = currentNode;
    let value = defaultValue;
    innerhook = newValue => {
      if (newValue === undefined) {
        return value;
      } else if (value !== newValue) {
        value = newValue;
        if (parentNode.update instanceof Function) {
          parentNode.update();
        }
      }
    };
    currentNode.hooks[currentNode.hookIndex] = innerhook;
  }
  currentNode.hookIndex++;
  return innerhook;
};
export const x = (tag, props = {}, factory) => {
  const innerVirtualDomIndex = virtualDomIndex;
  // Look existing node
  let virtualNode = virtualDom[virtualDomIndex];
  // If it does not exist create it
  if (!virtualNode || virtualNode.tag !== tag) {
    virtualNode = new VirtualNode(tag);
    virtualDom[virtualDomIndex] = virtualNode;
  }

  // Apply any props
  virtualNode.props = props;

  // Append to parent if it exists
  const parentNode = currentNode;
  if (parentNode) {
    parentNode.setChildAt(virtualNode, parentNode.virtualChildIndex);
    parentNode.virtualChildIndex++; // Increment the parent child index
  }

  // Change current node (global) to the current virtual dom before running the factory
  currentNode = virtualNode;
  virtualDomIndex++; // Increase the virtual dom index before running the factory

  if (factory instanceof Function) {
    factory(); // Execute the factory with the virtual dom as current node
  } else if (factory) {
    currentNode.node.textContent = String(factory); // If the factory is not a function set it as text content
  }

  // Revert global variables
  virtualNode.virtualChildIndex = 0;
  virtualNode.hookIndex = 0;
  currentNode = parentNode;

  virtualNode.update = () => {
    const previousVirtualDomIndex = virtualDomIndex;
    const previousCurrentNode = currentNode;
    virtualDomIndex = innerVirtualDomIndex;
    currentNode = virtualNode;
    virtualDomIndex++;
    factory();
    virtualNode.virtualChildIndex = 0;
    virtualNode.hookIndex = 0;
    currentNode = previousCurrentNode;
    virtualDomIndex = previousVirtualDomIndex;
  };
};
