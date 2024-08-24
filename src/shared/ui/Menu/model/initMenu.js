import MenuItem from './menuItem.js';
const menuMap = new WeakMap();

export default class Menu {
  constructor(rootElement, depth, parentMenu = null) {
    this.rootElement = rootElement;
    this.depth = depth;
    this.parentMenu = parentMenu;

    this.itemElements = [...this.rootElement.querySelectorAll(':scope > li')].map(item => new MenuItem(item, this));

    this.currentIndex = 0;
    this.currentItem = this.itemElements[this.currentIndex];

    if (this.depth === 1) {
      this.rootElement.setAttribute('role', 'menubar')
      this.itemElements[0].link.tabIndex = '0';
      this.rootElement.addEventListener('keydown', this.onKeyDown);
      this.rootElement.addEventListener('click', this.onMenuItemClick, true);
      this.rootElement.addEventListener('focusout', this.onMenubarFocusout.bind(this));
    } else {
      this.rootElement.setAttribute('role', 'menu')
    }

    menuMap.set(this.rootElement, this);
    this.bindEvents();
  }

  updateCurrentIndex = () => {
    this.currentIndex = this.itemElements.indexOf(this.currentItem);
  }

  setFocusToMenuitem = (index) => {
    this.itemElements.forEach(item => { item.link.tabIndex = '-1'; });
    this.itemElements[index].setFocus();
  }

  setFocusNextItem = () => {
    this.setFocusToMenuitem((this.currentIndex + 1) % this.itemElements.length);
  }

  setFocusPreviousItem = () => {
    const newIndex = (this.currentIndex - 1 + this.itemElements.length) % this.itemElements.length;
    this.setFocusToMenuitem(newIndex);
  }

  setFocusFirstItem = () => {
    this.setFocusToMenuitem(0);
  }

  setFocusLastItem = () => {
    this.setFocusToMenuitem(this.itemElements.length - 1);
  }

  setFocusFirstSubmenuItem = () => {
    if (this.currentItem.childMenu) {
      this.closeMenu();
      this.openMenu();
      this.currentItem.childMenu.setFocusFirstItem();
    }
  }

  setFocusLastSubmenuItem = () => {
    if (this.currentItem.childMenu) {
      this.openMenu();
      this.currentItem.childMenu.setFocusLastItem();
    }
  }

  arrowRightHandler = () => {
    if (this.depth === 1) {
      this.setFocusNextItem();
      return;
    }
    if (this.currentItem.hasSubMenu) {
      this.openMenu();
      this.setFocusFirstSubmenuItem();
    }
  }

  closeMenu = () => {
    this.currentItem.closeMenu();
  }

  closeAndReturnToParent = () => {
    this.parentMenu.setFocusToMenuitem(this.parentMenu.currentIndex);
    this.parentMenu.closeMenu();
  }

  getRootParent = () => {
    let rootMenu = this;
    while (rootMenu.parentMenu) {
      rootMenu = rootMenu.parentMenu;
    }
    return rootMenu;
  }

  openMenu = () => {
    this.itemElements.forEach(element => {
      if (element.hasSubMenu && element !== this.currentItem) {
        element.closeMenu();
      }
    });
    this.currentItem.openMenu();
  }

  handleEscape = () => {
    const rootParent = this.getRootParent();
    rootParent.setFocusToMenuitem(rootParent.currentIndex);
    rootParent.closeMenu();
  }

  getMenuInstance = (menuItem) => {
    const p = menuItem.closest('ul');
    return menuMap.get(p);
  }

  getMenuInstanceItem = (menu, menuItem) => {
    return menu.itemElements.find(item => item.menuItem === menuItem);
  }

  onKeyDown = (event) => {
    const { code, metaKey, key, target } = event;
    const closestLi = target.closest('li');
    const menuInstance = this.getMenuInstance(closestLi);

    const action = {
      ArrowUp: menuInstance.depth === 1 ? menuInstance.setFocusLastSubmenuItem : menuInstance.setFocusPreviousItem,
      ArrowDown: menuInstance.depth === 1 ? menuInstance.setFocusFirstSubmenuItem : menuInstance.setFocusNextItem,
      ArrowLeft: menuInstance.depth === 1 ? menuInstance.setFocusPreviousItem : menuInstance.closeAndReturnToParent,
      ArrowRight: menuInstance.arrowRightHandler,
      Home: menuInstance.setFocusFirstItem,
      End: menuInstance.setFocusLastItem,
      Escape: menuInstance.handleEscape,
      Tab: menuInstance.closeAllMenus,
    }[key];

    const isMacHomeKey = metaKey && code === 'ArrowLeft';
    if (isMacHomeKey) {
      this.firstTab();
      return;
    }

    const isMacEndKey = metaKey && code === 'ArrowRight';
    if (isMacEndKey) {
      this.lastTab();
      return;
    }

    if (action) {
      if (key !== 'Tab') {
        event.preventDefault();
        event.stopPropagation();
      }
      action?.();
    }
  }

  onMenuItemClick = (event) => {
    const menuElement = event.target?.closest('ul');
    const currentMenuItem = event.target?.closest('li');

    if (menuElement && currentMenuItem) {
      const menuMapItem = menuMap.get(menuElement);
      const menuItem = menuMapItem.itemElements.find(item => item.menuItem === currentMenuItem);
      if (menuMapItem) {
        menuMapItem.currentItem = menuItem;
        menuMapItem.updateCurrentIndex();
        if (menuMapItem.currentItem.hasSubMenu) {
          menuMapItem.setFocusToMenuitem(menuMapItem.currentIndex);
          menuMapItem.currentItem.link.ariaExpanded === 'true' ? menuMapItem.closeMenu() : menuMapItem.openMenu();
        }
      }
    }
  }

  onMenubarFocusout = (event) => {
    const isFocusContains = this.rootElement.contains(event.relatedTarget);
    if (!isFocusContains) {
      this.getRootParent().closeMenu();
    }
  }

  bindEvents = () => {
    // this.rootElement.addEventListener('keydown', this.onKeyDown);
    // this.rootElement.addEventListener('click', this.onMenuItemClick, true);
  }
}

