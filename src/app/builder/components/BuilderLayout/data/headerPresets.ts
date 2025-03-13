import { getAllHeaderItems } from "./headerItems";
import { PresetLayouts } from "../sidebar/types";

export const headerPresets = [
  {
    id: "preset1",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-default.svg",
  },
  {
    id: "preset2",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-default-center.svg",
  },
  {
    id: "preset3",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-default-dark.svg",
  },
  {
    id: "preset4",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-wide-nav-dark.svg",
  },
  {
    id: "preset5",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-wide-nav.svg",
  },
  {
    id: "preset6",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-simple.svg",
  },
  {
    id: "preset7",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-simple-center.svg",
  },
  {
    id: "preset8",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-simple-center.svg",
  },
  {
    id: "preset9",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-simple-right-buttons.svg",
  },
  {
    id: "preset10",
    image:
      "https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-cart-top.svg",
  },
  // New custom presets based on the image
  {
    id: "blue_header",
    image:
      "https://placehold.co/600x120/4a90e2/ffffff?text=Logo+%7C+Search+%7C+Account+%7C+Cart",
  },
  {
    id: "white_header_blue_nav",
    image:
      "https://placehold.co/600x120/ffffff/4a90e2?text=Logo+%7C+Search+%7C+Account+%7C+Cart",
  },
  {
    id: "mobile_simple",
    image:
      "https://placehold.co/600x80/ffffff/333333?text=Logo+%E2%98%B0%EF%B8%8E",
  },
  {
    id: "mobile_centered",
    image:
      "https://placehold.co/600x80/ffffff/333333?text=%E2%98%B0%EF%B8%8E+Logo+%F0%9F%94%8D",
  },
  {
    id: "simple_horizontal",
    image:
      "https://placehold.co/600x80/ffffff/333333?text=Logo+%7C+Link+Link+Link+BUY",
  },
  {
    id: "top_account_cart",
    image:
      "https://placehold.co/600x100/4a90e2/ffffff?text=ACCOUNT+CART+%7C+Logo+HOME+LINK1+LINK2",
  },
];

// Helper function to filter available items
const filterAvailableItems = (usedItems: string[]) => {
  return getAllHeaderItems()
    .map((item) => item.id)
    .filter((id) => !usedItems.includes(id));
};

export const presetLayouts: PresetLayouts = {
  preset1: {
    top_left: [],
    top_center: [],
    top_right: ["contact"],
    middle_left: ["logo"],
    middle_center: [],
    middle_right: ["cart"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: getAllHeaderItems()
      .map((item) => item.id)
      .filter((id) => !["logo", "search", "cart", "contact"].includes(id)),
  },
  preset2: {
    top_left: ["html_block_1"],
    top_center: [],
    top_right: ["topBarMenu", "followIcons", "contact"],
    middle_left: ["search", "mainMenu"],
    middle_center: ["logo"],
    middle_right: ["account", "cart"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: getAllHeaderItems()
      .map((item) => item.id)
      .filter(
        (id) =>
          ![
            "html_block_1",
            "topBarMenu",
            "followIcons",
            "search",
            "mainMenu",
            "logo",
            "account",
            "cart",
            "contact",
          ].includes(id)
      ),
  },
  preset3: {
    top_left: ["html_block_1"],
    top_center: ["html_block_2"],
    top_right: ["topBarMenu", "followIcons", "html_block_3"],
    middle_left: ["search", "mainMenu"],
    middle_center: ["logo"],
    middle_right: ["account", "cart"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: getAllHeaderItems()
      .map((item) => item.id)
      .filter(
        (id) =>
          ![
            "html_block_1",
            "html_block_2",
            "html_block_3",
            "topBarMenu",
            "followIcons",
            "search",
            "mainMenu",
            "logo",
            "account",
            "cart",
          ].includes(id)
      ),
  },
  // New presets based on the image layouts
  // Blue header with logo on left, search, account/cart on right, navigation below
  blue_header: {
    top_left: [],
    top_center: [],
    top_right: [],
    middle_left: ["logo"],
    middle_center: [],
    middle_right: ["account", "divider_1", "cart"],
    bottom_left: ["mainMenu"],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems([
      "logo",
      "account",
      "divider_1",
      "cart",
      "mainMenu",
    ]),
  },
  // White header with logo on left, search, account/cart on right, blue navigation below
  white_header_blue_nav: {
    top_left: [],
    top_center: [],
    top_right: [],
    middle_left: ["logo", "search"],
    middle_center: [],
    middle_right: ["account", "divider_1", "cart"],
    bottom_left: ["mainMenu"],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems([
      "logo",
      "search",
      "account",
      "divider_1",
      "cart",
      "mainMenu",
    ]),
  },
  // Mobile layout with logo on left and hamburger menu on right
  mobile_simple: {
    top_left: [],
    top_center: [],
    top_right: [],
    middle_left: ["logo"],
    middle_center: [],
    middle_right: ["nav_icon"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems(["logo", "nav_icon"]),
  },
  // Mobile layout with centered logo and hamburger/search on sides
  mobile_centered: {
    top_left: [],
    top_center: [],
    top_right: [],
    middle_left: ["nav_icon"],
    middle_center: ["logo"],
    middle_right: ["search"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems(["logo", "nav_icon", "search"]),
  },
  // Simple horizontal layout with logo on left and links + buy button on right
  simple_horizontal: {
    top_left: [],
    top_center: [],
    top_right: [],
    middle_left: ["logo"],
    middle_center: [],
    middle_right: ["mainMenu", "button_1"],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems(["logo", "mainMenu", "button_1"]),
  },
  // Header with logo on left, account/cart on top right
  top_account_cart: {
    top_left: [],
    top_center: [],
    top_right: ["account", "cart"],
    middle_left: ["logo"],
    middle_center: ["mainMenu"],
    middle_right: [],
    bottom_left: [],
    bottom_center: [],
    bottom_right: [],
    available: filterAvailableItems(["logo", "account", "cart", "mainMenu"]),
  },
};
