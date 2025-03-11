import { HeaderSettings } from "./types";
import menuItemsData from "@/app/builder/data/menu-items.json";

// Default header settings
export const defaultHeaderSettings: HeaderSettings = {
  topBarVisible: true,
  topBarColorScheme: "light",
  mainBarColorScheme: "light", // Default for main section
  bottomBarColorScheme: "light", // Default for bottom section
  showTopBarButton: false,
  navigation: {
    menuType: "mainMenu",
    items: menuItemsData.mainMenu.items,
  },
};
