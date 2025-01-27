export type HeaderItem = {
  id: string;
  label: string;
  builderLabel?: string; 
  type: 'core' | 'extended' | 'divider';
  customizable?: boolean;
};

// Core header items that are always available
export const headerItems: HeaderItem[] = [
  { id: 'logo', label: 'Logo & Site Identity', builderLabel: 'Logo', type: 'core' },
  { id: 'topBar', label: 'Top Bar', builderLabel: 'Top Bar', type: 'core' },
  { id: 'headerMain', label: 'Header Main', builderLabel: 'Main', type: 'core' },
  { id: 'headerBottom', label: 'Header Bottom', builderLabel: 'Bottom', type: 'core' },
  { id: 'mobileMenu', label: 'Header Mobile Menu / Overlay', builderLabel: 'Mobile Menu', type: 'core' },
  { id: 'stickyHeader', label: 'Sticky Header', builderLabel: 'Sticky', type: 'core' },
  { id: 'dropdown', label: 'Dropdown Style', builderLabel: 'Dropdown', type: 'core' },
  { id: 'buttons', label: 'Buttons', builderLabel: 'Buttons', type: 'core' },
  { id: 'account', label: 'Account', builderLabel: 'Account', type: 'core' },
  { id: 'search', label: 'Search', builderLabel: 'Search', type: 'core' },
  { id: 'html', label: 'HTML', builderLabel: 'HTML', type: 'core', customizable: true },
  { id: 'followIcons', label: 'Follow Icons', builderLabel: 'Social', type: 'core' }
];

// Extended items for additional functionality
export const extendedItems: HeaderItem[] = [
  { id: 'divider1', label: '|', type: 'divider' },
  { id: 'divider2', label: '|', type: 'divider' },
  { id: 'divider3', label: '|', type: 'divider' },
  { id: 'divider4', label: '|', type: 'divider' },
];

// Combine core and extended items
export const getAllHeaderItems = () => [...headerItems, ...extendedItems];
