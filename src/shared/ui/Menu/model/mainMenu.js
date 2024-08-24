class Menu {
  constructor(menuConfig) {
    let defaultOptions = {
      modClass: "test",
    };

    this.parentSelector = menuConfig.parent;
    this.menuItems = menuConfig.menuItems;
    this.options = Object.assign(defaultOptions, menuConfig.options);
    this.class = this.options.modClass || '';

    this.parentNode = document.querySelector(`${this.parentSelector}`);
    this.menuList = this.parentNode.querySelector('ul.menu__list');

    this.parentNode.addEventListener('focusout', this.onBlur.bind(this))
    this.hasSubmenuItemLink = `url('../img/for_sprite/sprite-stack.svg#chevrone');`

    this.createMenu();
    this.setWatcher();
  }


  setWatcher() {
    const items = document.querySelectorAll('li.has-submenu');
    if (items && items.length > 0) {
      items.forEach(item => {
        const toggleBtn = item.querySelector('button.menu__link');
        const menu = item.querySelector('ul');

        toggleBtn.addEventListener('click', this.onButtonClick.bind(this));
        toggleBtn.addEventListener('keydown', this.onButtonKeyDown.bind(this));
        menu.addEventListener('keydown', this.onMenuKeyDown.bind(this))
      })
    }
  }

  //handle Menu  ==============  
  onBlur(e) {
    const menuContainsFocus = this.parentNode.contains(e.relatedTarget) // принадлежит ли элемент получивший focus главному меню
    if (menuContainsFocus) return;
    this.closeMenu();
  }

  onButtonClick(e) {
    const parentUl = e.target.closest('ul');
    if (e.target.classList.contains('is-expanded')) {
      this.closeMenu(e.target.parentNode)
    }
    else {
      this.closeMenu(parentUl);
      e.target.classList.add('is-expanded');
      e.target.ariaExpanded = 'true';
    }
  }

  onButtonKeyDown(e) {
    console.log('button key pressed ' + e.key);
    if (e.key === 'Escape') {
      this.closeMenu();
    };
  }

  onMenuKeyDown(e) {
    if (e.key === 'Escape') this.closeMenu();
  }

  closeMenu(item) {
    const parentElement = item ?? document.body;
    parentElement.querySelectorAll('.is-expanded').forEach(item => {
      item.classList.remove('is-expanded');
      item.ariaExpanded = 'false';
    });
  }
  //==========================================


  //create Menu  =============================
  createMenu() {
    const menuInner = this.menuItems.map(item => this.generateMenuItem(item));
    menuInner.forEach(element => {
      this.menuList.append(element)
    });
  }
  //create Menu

  generateMenuItem(item) {
    const hasSubmenu = item.submenu ? true : false;

    const li = document.createElement('li')
    li.classList.add('menu__item');

    const tagElement = (hasSubmenu ? this.getMenuButtonElement : this.getMenuLinkElement)(item)

    if (hasSubmenu) {
      li.classList.add('has-submenu');
      tagElement.classList.add
    }

    li.append(tagElement);

    if (hasSubmenu && item.submenu.length > 0) {

      const ul = document.createElement('ul');
      ul.classList.add('menu__sub-list');

      const submenuInner = item.submenu.map(el => this.generateMenuItem(el))

      submenuInner.forEach(e => {
        ul.append(e)
      })

      li.append(ul)
    }

    return li;
  }
  //create Menu
  getMenuButtonElement(item) {
    const btn = document.createElement('button');
    btn.classList.add('menu__link');
    btn.innerText = item.name;
    btn.type = 'button';
    btn.ariaLabel = `open ${item.name} navigation`;
    btn.ariaExpanded = false;
    return btn;
  }
  //create Menu
  getMenuLinkElement(item) {
    const a = document.createElement('a');
    a.classList.add('menu__link');
    a.ariaLabel = `go to ${item.name} page`
    a.innerText = item.name;
    a.href = item.url;
    return a;
  }
  //=====================================

}

export default Menu;