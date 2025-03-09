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
];

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
};
