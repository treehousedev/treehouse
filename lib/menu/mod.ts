
export interface Menu {
  id: string;
  command: string;
  alt?: string;
  //when
  //group
  //submenu
}

export class MenuRegistry {
  menus: {[index: string]: Menu};

  constructor() {
    this.menus = {};
  }

  registerMenu(menu: Menu) {
    this.menus[menu.id] = menu;
  }
}