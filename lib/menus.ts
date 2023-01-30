
export interface MenuItem {
  command: string;
  //alt?: string;
  //when
  //group
  //submenu
}

export class MenuRegistry {
  menus: {[index: string]: MenuItem[]};

  constructor() {
    this.menus = {};
  }

  registerMenu(id: string, items: MenuItem[]) {
    this.menus[id] = items;
  }
}