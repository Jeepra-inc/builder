import { HTMLContentMapType } from "./types";

// Default HTML content for various header items
export const HTMLContentMap: HTMLContentMapType = {
  logo: '<img src="/logo.svg" class="h-8" alt="Logo" />',
  account: `<div class="account-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
             </svg>
           </div>`,
  cart: `<div class="cart-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
           </svg>
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
  mainMenu: `<nav class="main-menu">
    <ul class="flex gap-6">
      <li class="hover:text-primary cursor-pointer">Home</li>
      <li class="hover:text-primary cursor-pointer">Shop</li>
      <li class="hover:text-primary cursor-pointer">About</li>
      <li class="hover:text-primary cursor-pointer">Contact</li>
              </ul>
            </nav>`,
  topBarMenu: `<div class="top-bar-menu">
    <ul class="flex gap-3 text-sm">
      <li class="hover:underline cursor-pointer">Support</li>
      <li class="hover:underline cursor-pointer">Contact</li>
      <li class="hover:underline cursor-pointer">Store Locator</li>
    </ul>
  </div>`,
  bottomMenu: `<div class="bottom-bar-menu">
    <ul class="flex gap-4 text-sm">
      <li class="hover:underline cursor-pointer">Terms</li>
      <li class="hover:underline cursor-pointer">Privacy</li>
      <li class="hover:underline cursor-pointer">Returns</li>
    </ul>
  </div>`,
  nav_icon: `<button class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
    <span class="ml-2">Menu</span>
  </button>`,
  wishlist: `<div class="wishlist-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
          </div>`,
  social_icon: `<div class="social-icon-group flex gap-2">
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
    </a>
                </div>`,
  button_1: `<button class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Button 1</button>`,
  button_2: `<button class="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white">Button 2</button>`,
  divider_1: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_2: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_3: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_4: `<div class="h-6 w-px bg-gray-300"></div>`,
};
