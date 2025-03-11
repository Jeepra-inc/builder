import { generateMenuHTML } from "./menuUtils";
import menuItemsData from "@/app/builder/data/menu-items.json";
import { HeaderSettings } from "./types";

// Define the headerDefaults function that takes settings as input
export const getHeaderDefaults = (headerSettings: HeaderSettings) => ({
  logo: `<div class="logo-container">
    <img src="/logo.svg" class="h-8" alt="Logo" />
    <span class="ml-2 font-bold text-lg">Your Brand</span>
  </div>`,
  searchIcon: `<div class="search-icon flex items-center justify-center">
    <button class="text-current hover:text-primary flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  </div>`,
  navIcon: `<div class="nav-icon-container" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;">
    <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>
      <span class="nav-icon-text">Menu</span>
    </div>
  </div>`,
  contact: `<div class="contact-info-container" data-item-id="contact" style="display: flex; flex-direction: column; gap: 5px;">
    <div class="contact-item email" style="display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      <span class="contact-label">Email: </span>
      <a href="mailto:contact@example.com" class="contact-value">contact@example.com</a>
    </div>
    <div class="contact-item phone" style="display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
      <a href="tel:+1234567890" class="contact-value">(123) 456-7890</a>
    </div>
  </div>`,
  mainMenu: generateMenuHTML(
    "mainMenu",
    headerSettings.navigation?.menuType === "mainMenu"
      ? headerSettings.navigation?.items
      : []
  ),
  topBarMenu: generateMenuHTML(
    "topBarMenu",
    headerSettings.navigation?.menuType === "topBarMenu"
      ? headerSettings.navigation?.items
      : menuItemsData.topBarMenu.items
  ),
  bottomMenu: generateMenuHTML(
    "bottomMenu",
    headerSettings.navigation?.menuType === "bottomMenu"
      ? headerSettings.navigation?.items
      : menuItemsData.bottomMenu.items
  ),
  followIcons: `<div class="social-icons flex gap-3">
    <a href="#" class="hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
    </a>
    <a href="#" class="hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
    </a>
  </div>`,
});
