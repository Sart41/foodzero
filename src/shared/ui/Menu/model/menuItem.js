import Menu from './initMenu.js'
import styles from './../ui/Menu.module.scss'
const svgIcon = `<svg class="${styles.subMenuIcon}" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1638" height="1024" viewBox="0 0 1638 1024">
<g id="icomoon-ignore">
</g>
<path d="M1481.013 11.419c7.69-7.308 18.158-11.419 29.078-11.419s21.387 4.111 29.078 11.419l86.821 81.839c7.92 7.005 12.411 16.786 12.411 27.022s-4.491 20.017-12.411 27.022l-752.73 709.526c-11.51 10.863-27.124 16.972-43.411 16.986h-21.295c-16.288-0.014-31.902-6.124-43.411-16.986l-752.73-709.526c-7.919-7.005-12.411-16.786-12.411-27.022s4.492-20.017 12.411-27.022l86.822-81.839c7.69-7.308 18.157-11.419 29.077-11.419s21.387 4.111 29.077 11.419l661.813 623.828 661.813-623.828z"></path>
</svg>
`

export default class MenuItem {
  constructor(menuItem, parentMenu) {
    //parentMenu(Menu), childMenu, link
    this.menuItem = menuItem
    this.parentMenu = parentMenu
    this.link = this.menuItem.querySelector(':scope > a')

    const childMenuElement = this.menuItem.querySelector(':scope>ul')
    if (childMenuElement) {
      this.hasSubMenu = true;
      this.childMenu = new Menu(childMenuElement, this.parentMenu.depth + 1, this.parentMenu)
      this.link.setAttribute('aria-haspopup', 'true');
      this.link.setAttribute('aria-expanded', 'false');
      // this.link.insertAdjacentHTML('beforeend', svgIcon);
      const span = document.createElement('span')
      span.classList.add(styles.chevrone)
      this.link.appendChild(span)
    } else {
      this.hasSubMenu = false
    }

    this.menuItem.setAttribute('role', 'none')
    this.link.setAttribute('role', 'menuitem');
    this.link.setAttribute('tabindex', '-1');
  }

  setFocus = () => {
    this.link.focus()
    this.link.tabIndex = '0'
    this.parentMenu.currentItem = this
    this.parentMenu.updateCurrentIndex()
  }

  closeMenu = () => {
    if (this.childMenu) {
      this.childMenu.itemElements.forEach(element => {
        element.link.tabIndex = '-1'
        if (element.hasSubMenu) element.closeMenu()
      });
    }
    this.childMenu?.rootElement.classList.remove(styles.open)
    this.link.ariaExpanded = 'false'
  }

  openMenu = () => {
    this.childMenu.rootElement.classList.add(styles.open)
    this.link.ariaExpanded = 'true'
  }
}


