export { Menu, toggledShowMenu } from './ui/Menu.jsx'
import Menu from './model/initMenu.js'
import TestMenu from './model/testMenu.js'

const menuRootSelector = '.menu'

const initMenu = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const menuElements = document.querySelectorAll(menuRootSelector);
    const firstLevelMenus = [...menuElements].filter(menu => !menu.parentElement.closest(menuRootSelector));
    if (firstLevelMenus.length) {
      firstLevelMenus.forEach((menuElement) => {
        new Menu(menuElement, 1)
      })
    }
  });
}

initMenu()