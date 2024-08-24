export default class MenubarNavigation {
  constructor(domNode) {
    this.domNode = domNode;
    this.menuitems = [];
    this.popups = [];
    this.menuitemGroups = {};
    this.menuOrientation = {};
    this.isPopup = {};
    this.isPopout = {};
    this.openPopups = false;

    this.firstChars = {};
    this.firstMenuitem = {};
    this.lastMenuitem = {};

    this.initMenu(domNode, 0);

    domNode.addEventListener('focusin', () => this.onMenubarFocusin());
    domNode.addEventListener('focusout', () => this.onMenubarFocusout());

    window.addEventListener('pointerdown', (event) => this.onBackgroundPointerdown(event), true);

    const firstMenuitem = domNode.querySelector('[role=menuitem]');
    if (firstMenuitem) firstMenuitem.tabIndex = 0;
  }

  getParentMenuitem(menuitem) {
    const previousSibling = menuitem.parentNode?.previousElementSibling;
    return previousSibling?.getAttribute('role') === 'menuitem' ? previousSibling : false;
  }

  getMenuitems(domNode, depth) {
    const nodes = [];
    const initMenu = (node, depth) => this.initMenu(node, depth);
    const findMenuitems = (node) => {
      while (node) {
        const role = node.getAttribute('role')?.trim().toLowerCase();
        let flag = true;

        switch (role) {
          case 'menu':
            node.tabIndex = -1;
            initMenu(node, depth + 1);
            flag = false;
            break;

          case 'menuitem':
            if (node.getAttribute('aria-haspopup') === 'true') {
              this.popups.push(node);
            }
            nodes.push(node);
            break;
        }

        if (flag && node.firstElementChild && node.firstElementChild.tagName !== 'svg') {
          findMenuitems(node.firstElementChild);
        }
        node = node.nextElementSibling;
      }
    };
    findMenuitems(domNode.firstElementChild);
    return nodes;
  }

  initMenu(menu, depth) {
    const menuId = this.getMenuId(menu);
    console.log(menuId);
    const menuitems = this.getMenuitems(menu, depth);
    this.menuOrientation[menuId] = this.getMenuOrientation(menu);

    this.isPopup[menuId] = menu.getAttribute('role') === 'menu' && depth === 1;
    this.isPopout[menuId] = menu.getAttribute('role') === 'menu' && depth > 1;

    this.menuitemGroups[menuId] = [];
    this.firstChars[menuId] = [];
    this.firstMenuitem[menuId] = null;
    this.lastMenuitem[menuId] = null;

    menuitems.forEach((menuitem) => {
      const role = menuitem.getAttribute('role');

      if (!role.includes('menuitem')) return;

      menuitem.tabIndex = -1;
      this.menuitems.push(menuitem);
      this.menuitemGroups[menuId].push(menuitem);
      this.firstChars[menuId].push(menuitem.textContent.trim().toLowerCase()[0]);

      menuitem.addEventListener('keydown', (event) => this.onKeydown(event));
      menuitem.addEventListener('click', (event) => this.onMenuitemClick(event), true);
      menuitem.addEventListener('pointerover', (event) => this.onMenuitemPointerover(event));

      if (!this.firstMenuitem[menuId]) {
        if (this.hasPopup(menuitem)) {
          menuitem.tabIndex = 0;
        }
        this.firstMenuitem[menuId] = menuitem;
      }
      this.lastMenuitem[menuId] = menuitem;
    });
  }

  setFocusToMenuitem(menuId, newMenuitem) {
    if (this.menuitemGroups[menuId]) {
      this.menuitemGroups[menuId].forEach((item) => {
        item.tabIndex = item === newMenuitem ? 0 : -1;
      });
      newMenuitem?.focus();
    }
  }

  setFocusToFirstMenuitem(menuId) {
    this.setFocusToMenuitem(menuId, this.firstMenuitem[menuId]);
  }

  setFocusToLastMenuitem(menuId) {
    this.setFocusToMenuitem(menuId, this.lastMenuitem[menuId]);
  }

  setFocusToPreviousMenuitem(menuId, currentMenuitem) {
    let newMenuitem = this.firstMenuitem[menuId];
    const index = this.menuitemGroups[menuId].indexOf(currentMenuitem);

    if (currentMenuitem !== this.firstMenuitem[menuId]) {
      newMenuitem = this.menuitemGroups[menuId][index - 1];
    }
    this.setFocusToMenuitem(menuId, newMenuitem);
    return newMenuitem;
  }

  setFocusToNextMenuitem(menuId, currentMenuitem) {
    let newMenuitem = this.lastMenuitem[menuId];
    const index = this.menuitemGroups[menuId].indexOf(currentMenuitem);

    if (currentMenuitem !== this.lastMenuitem[menuId]) {
      newMenuitem = this.menuitemGroups[menuId][index + 1];
    }
    this.setFocusToMenuitem(menuId, newMenuitem);
    return newMenuitem;
  }

  setFocusByFirstCharacter(menuId, currentMenuitem, char) {
    char = char.toLowerCase();
    let start = this.menuitemGroups[menuId].indexOf(currentMenuitem) + 1;
    if (start >= this.menuitemGroups[menuId].length) start = 0;

    let index = this.getIndexFirstChars(menuId, start, char);
    if (index === -1) index = this.getIndexFirstChars(menuId, 0, char);

    if (index > -1) {
      this.setFocusToMenuitem(menuId, this.menuitemGroups[menuId][index]);
    }
  }

  getIndexFirstChars(menuId, startIndex, char) {
    return this.firstChars[menuId].slice(startIndex).indexOf(char) + startIndex;
  }

  isPrintableCharacter(str) {
    return str.length === 1 && /\S/.test(str);
  }

  getIdFromAriaLabel(node) {
    return node.getAttribute('aria-label')?.trim().toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') || '';
  }

  getMenuOrientation(node) {
    let orientation = node.getAttribute('aria-orientation');
    if (!orientation) {
      const role = node.getAttribute('role');
      orientation = role === 'menubar' ? 'horizontal' : (role === 'menu' ? 'vertical' : undefined);
    }
    return orientation;
  }

  getMenuId(node) {
    let id = false;
    let role = node.getAttribute('role');

    while (node && role !== 'menu' && role !== 'menubar') {
      node = node.parentNode;
      role = node?.getAttribute('role');
    }

    if (node) {
      id = `${role}-${this.getIdFromAriaLabel(node)}`;
    }
    return id;
  }

  getMenu(menuitem) {
    let menu = menuitem;
    let role = menuitem.getAttribute('role');

    while (menu && role !== 'menu' && role !== 'menubar') {
      menu = menu.parentNode;
      role = menu?.getAttribute('role');
    }

    return menu;
  }

  isAnyPopupOpen() {
    return this.popups.some(popup => popup.getAttribute('aria-expanded') === 'true');
  }

  setMenubarDataExpanded(value) {
    this.domNode.setAttribute('data-menubar-item-expanded', value);
  }

  isMenubarDataExpandedTrue() {
    return this.domNode.getAttribute('data-menubar-item-expanded') === 'true';
  }

  openPopup(menuId, menuitem) {
    const popupMenu = menuitem.nextElementSibling;
    if (popupMenu) {
      const rect = menuitem.getBoundingClientRect();
      popupMenu.style.display = 'block';
      popupMenu.style.position = this.isPopup[menuId] ? 'absolute' : 'fixed';
      popupMenu.style.left = this.isPopup[menuId] ? `${rect.width + 10}px` : '0px';
      popupMenu.style.top = this.isPopup[menuId] ? '0px' : `${rect.height + 8}px`;
      popupMenu.style.zIndex = 100;

      menuitem.setAttribute('aria-expanded', 'true');
      this.setMenubarDataExpanded('true');
      return this.getMenuId(popupMenu);
    }
    return false;
  }

  closePopout(menuitem) {
    let menuId = this.getMenuId(menuitem);
    let cmi = menuitem;

    while (this.isPopup[menuId] || this.isPopout[menuId]) {
      const menu = this.getMenu(cmi);
      cmi = menu.previousElementSibling;
      menuId = this.getMenuId(cmi);
      menu.style.display = 'none';
    }
    cmi.focus();
    return cmi;
  }

  closePopup(menuitem) {
    const menuId = this.getMenuId(menuitem);

    if (this.isPopup[menuId] || this.isPopout[menuId]) {
      menuitem.setAttribute('aria-expanded', 'false');
      this.setMenubarDataExpanded('false');
      menuitem.nextElementSibling.style.display = 'none';
    }
  }

  closePopupAll() {
    this.popups.forEach((popup) => {
      if (popup.getAttribute('aria-expanded') === 'true') {
        this.closePopup(popup);
      }
    });
  }

  onMenubarFocusin() {
    this.setMenubarDataExpanded('true');
  }

  onMenubarFocusout() {
    if (!this.isAnyPopupOpen()) {
      this.setMenubarDataExpanded('false');
    }
  }

  onBackgroundPointerdown(event) {
    if (!this.domNode.contains(event.target)) {
      this.closePopupAll();
    }
  }

  onKeydown = (event) => {
    const { key } = event;
    const target = event.currentTarget;
    const menuId = this.getMenuId(target);

    switch (key) {
      case ' ':
      case 'Enter':
        if (this.hasPopup(target)) {
          this.openPopups = true;
          const popupMenuId = this.openPopup(menuId, target);
          this.setFocusToFirstMenuitem(popupMenuId);
        } else if (target.href !== '#') {
          this.closePopupAll();
          this.updateContent(target.href, target.textContent.trim());
          this.setMenubarDataExpanded('false');
        }
        break;

      case 'Escape':
        this.openPopups = false;
        const closedMenuitem = this.closePopup(target);
        this.setMenubarDataExpanded('false');
        this.setFocusToMenuitem(this.getMenuId(closedMenuitem), closedMenuitem);
        break;

      case 'ArrowUp':
        if (this.isMenuHorizontal(menuId)) {
          if (this.hasPopup(target)) {
            this.openPopups = true;
            const upPopupMenuId = this.openPopup(menuId, target);
            this.setFocusToLastMenuitem(upPopupMenuId);
          }
        } else {
          this.setFocusToPreviousMenuitem(menuId, target);
        }
        break;

      case 'ArrowDown':
        if (this.isMenuHorizontal(menuId)) {
          if (this.hasPopup(target)) {
            this.openPopups = true;
            const downPopupMenuId = this.openPopup(menuId, target);
            this.setFocusToFirstMenuitem(downPopupMenuId);
          }
        } else {
          this.setFocusToNextMenuitem(menuId, target);
        }
        break;

      case 'ArrowLeft':
        if (this.isMenuHorizontal(menuId)) {
          const prevMenuitem = this.setFocusToPreviousMenuitem(menuId, target);
          if (this.isAnyPopupOpen() || this.isMenubarDataExpandedTrue()) {
            this.openPopup(menuId, prevMenuitem);
          }
        } else {
          const closedPopupMenuitem = this.closePopup(target);
          const newMenuId = this.getMenuId(closedPopupMenuitem);
          const prevMenuitem = this.setFocusToPreviousMenuitem(newMenuId, closedPopupMenuitem);
          this.openPopup(newMenuId, prevMenuitem);
        }
        break;

      case 'ArrowRight':
        if (this.isMenuHorizontal(menuId)) {
          const nextMenuitem = this.setFocusToNextMenuitem(menuId, target);
          if (this.isAnyPopupOpen() || this.isMenubarDataExpandedTrue()) {
            this.openPopup(menuId, nextMenuitem);
          }
        } else if (this.hasPopup(target)) {
          const popupMenuId = this.openPopup(menuId, target);
          this.setFocusToFirstMenuitem(popupMenuId);
        } else {
          const closedPopupMenuitem = this.closePopout(target);
          const newMenuId = this.getMenuId(closedPopupMenuitem);
          const nextMenuitem = this.setFocusToNextMenuitem(newMenuId, closedPopupMenuitem);
          this.openPopup(newMenuId, nextMenuitem);
        }
        break;

      case 'Home':
      case 'PageUp':
        this.setFocusToFirstMenuitem(menuId);
        break;

      case 'End':
      case 'PageDown':
        this.setFocusToLastMenuitem(menuId);
        break;

      case 'Tab':
        this.openPopups = false;
        this.setMenubarDataExpanded('false');
        this.closePopup(target);
        break;

      default:
        if (this.isPrintableCharacter(key)) {
          this.setFocusByFirstCharacter(menuId, target, key);
        }
        break;
    }

    event.stopPropagation();
    event.preventDefault();
  }

  onMenuitemClick = (event) => {
    const target = event.currentTarget;
    const menuId = this.getMenuId(target);

    if (this.hasPopup(target)) {
      if (this.isOpen(target)) {
        this.closePopup(target);
      } else {
        this.closePopupAll();
        this.openPopup(menuId, target);
      }
    } else {
      this.updateContent(target.href, target.textContent.trim());
      this.closePopupAll();
    }

    event.stopPropagation();
    event.preventDefault();
  }

  onMenuitemPointerover = (event) => {
    const target = event.currentTarget;
    const menuId = this.getMenuId(target);

    if (this.hasFocus()) {
      this.setFocusToMenuitem(menuId, target);
    }

    if (this.isAnyPopupOpen() || this.hasFocus()) {
      this.closePopupAll();
      if (this.hasPopup(target)) {
        this.openPopup(menuId, target);
      }
    }
  }

  hasPopup = (menuitem) => menuitem.getAttribute('aria-haspopup') === 'true';
}
