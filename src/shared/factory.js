export function factory(component, props, ...children) {
  if (typeof component === "function") {
    return component({ ...props, children });
  }

  const isSVG = tag => ['path', 'svg', 'use', 'g'].includes(tag);
  const node = isSVG(component)
    ? document.createElementNS('http://www.w3.org/2000/svg', component)
    : document.createElement(component);

  for (const [key, value] of Object.entries(props || {})) {
    if (typeof value === 'function') {
      node.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }

  const renderChildren = (_children) => {
    _children.forEach(child => {
      if (typeof child === 'string' || typeof child === "number") {
        node.appendChild(document.createTextNode(child.toString()))
      } else if (Array.isArray(child)) {
        renderChildren(child);
      } else try {
        node.appendChild(child)
      } catch (error) {
        console.log(error);
      }

    })
  }
  renderChildren(children);

  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  // node.dataset.key = id;

  return node
}