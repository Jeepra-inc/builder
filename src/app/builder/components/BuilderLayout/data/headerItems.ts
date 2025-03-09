export type HeaderItem = {
  id: string;
  label: string;
  builderLabel?: string;
  type: "core" | "extended" | "divider";
  customizable?: boolean;
};

// Core header items that are always available
export const headerItems: HeaderItem[] = [
  {
    id: "logo",
    label: "Logo & Site Identity",
    builderLabel: "Logo",
    type: "core",
  },
  {
    id: "html_block_1",
    label: "HTML Block 1",
    builderLabel: "HTML 1",
    type: "core",
    customizable: true,
  },
  {
    id: "html_block_2",
    label: "HTML Block 2",
    builderLabel: "HTML 2",
    type: "core",
    customizable: true,
  },
  {
    id: "html_block_3",
    label: "HTML Block 3",
    builderLabel: "HTML 3",
    type: "core",
    customizable: true,
  },
  {
    id: "html_block_4",
    label: "HTML Block 4",
    builderLabel: "HTML 4",
    type: "core",
    customizable: true,
  },
  {
    id: "html_block_5",
    label: "HTML Block 5",
    builderLabel: "HTML 5",
    type: "core",
    customizable: true,
  },
  { id: "account", label: "Account", builderLabel: "Account", type: "core" },
  {
    id: "topBarMenu",
    label: "Top Bar Menu",
    builderLabel: "Top Bar Menu",
    type: "core",
  },
  { id: "cart", label: "Cart", builderLabel: "Cart", type: "core" },
  { id: "nav_icon", label: "Nav Icon", builderLabel: "Nav Icon", type: "core" },
  {
    id: "mainMenu",
    label: "Main Menu",
    builderLabel: "Main Menu",
    type: "core",
  },
  {
    id: "bottomMenu",
    label: "Bottom Bar Menu",
    builderLabel: "Bottom Menu",
    type: "core",
  },
  { id: "search", label: "Search", builderLabel: "Search", type: "core" },
  { id: "contact", label: "Contact", builderLabel: "Contact", type: "core" },
  { id: "button_1", label: "Button 1", builderLabel: "Button 1", type: "core" },
  { id: "button_2", label: "Button 2", builderLabel: "Button 2", type: "core" },
  { id: "wishlist", label: "Wishlist", builderLabel: "Wishlist", type: "core" },
  {
    id: "social_icon",
    label: "Social Icons",
    builderLabel: "Social Icons",
    type: "core",
  },
];

// Extended items for additional functionality
export const extendedItems: HeaderItem[] = [
  { id: "divider_1", label: "|", type: "divider" },
  { id: "divider_2", label: "|", type: "divider" },
  { id: "divider_3", label: "|", type: "divider" },
  { id: "divider_4", label: "|", type: "divider" },
];

// Combine core and extended items
export const getAllHeaderItems = () => [...headerItems, ...extendedItems];
