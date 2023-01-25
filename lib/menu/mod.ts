
export interface MenuItem {
  command: string;
  //alt?: string;
  //when
  //group
  //submenu
}

export class MenuRegistry {
  menus: {[index: string]: MenuItems[]};

  constructor() {
    this.menus = {};
  }

  registerMenu(id: string, items: MenuItems[]) {
    this.menus[id] = items;
  }
}