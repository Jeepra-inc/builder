/**
 * Drawer utility functions for the iframe
 */

import { createDrawerOverlay, attachDrawerCloseHandlers } from "./domUtils";
import { DrawerEffect, DrawerDirection, NavIconSettings } from "./drawerTypes";

/**
 * Add drawer CSS to the document if not already present
 */
export const addDrawerStyles = (): void => {
  if (!document.getElementById("nav-drawer-style")) {
    const style = document.createElement("style");
    style.id = "nav-drawer-style";
    style.textContent = `
      .nav-drawer {
        position: fixed;
        z-index: 1000;
        top: 0;
        width: 300px;
        height: 100%;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      
      .nav-drawer-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      
      .nav-drawer-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
      }
      
      .nav-drawer-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      }
      
      .nav-drawer-body {
        padding: 20px;
        flex: 1;
      }
      
      .nav-drawer-body ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .nav-drawer-body li {
        margin-bottom: 15px;
      }
      
      .nav-drawer-body a {
        color: #333;
        text-decoration: none;
        font-size: 18px;
        display: block;
        padding: 5px 0;
      }
      
      /* Slide effect */
      .slide-left {
        left: 0;
        transform: translateX(-100%);
      }
      
      .slide-left.active {
        transform: translateX(0);
      }
      
      .slide-right {
        right: 0;
        transform: translateX(100%);
      }
      
      .slide-right.active {
        transform: translateX(0);
      }
      
      /* Fade effect */
      .fade-left, .fade-right {
        opacity: 0;
        pointer-events: none;
      }
      
      .fade-left {
        left: 0;
      }
      
      .fade-right {
        right: 0;
      }
      
      .fade-left.active, .fade-right.active {
        opacity: 1;
        pointer-events: auto;
      }
      
      /* Push effect */
      .push-left {
        left: 0;
        transform: translateX(-100%);
      }
      
      .push-right {
        right: 0;
        transform: translateX(100%);
      }
      
      /* Top drawer */
      .slide-top, .fade-top, .push-top {
        top: 0;
        left: 0;
        width: 100%;
        height: 300px;
        transform: translateY(-100%);
      }
      
      .slide-top.active, .push-top.active {
        transform: translateY(0);
      }
      
      .fade-top {
        opacity: 0;
        pointer-events: none;
      }
      
      .fade-top.active {
        opacity: 1;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Create a drawer with navigation menu
 * @param effect The drawer effect (slide, fade, push)
 * @param direction The drawer direction (left, right, top)
 * @returns The drawer element
 */
export const createNavigationDrawer = (
  effect: DrawerEffect = "slide",
  direction: DrawerDirection = "left"
): HTMLDivElement => {
  // Add drawer styles
  addDrawerStyles();

  // Create or get drawer
  let drawer = document.getElementById("nav-drawer") as HTMLDivElement | null;

  // If drawer exists, remove it first
  if (drawer && drawer.parentNode) {
    drawer.parentNode.removeChild(drawer);
  }

  // Create new drawer
  drawer = document.createElement("div") as HTMLDivElement;
  drawer.id = "nav-drawer";
  drawer.className = `nav-drawer ${effect}-${direction}`;

  // Create drawer content
  drawer.innerHTML = `
    <div class="nav-drawer-content">
      <div class="nav-drawer-header">
        <button class="nav-drawer-close">×</button>
      </div>
      <div class="nav-drawer-body">
        <nav>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">Products</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </div>
    </div>
  `;

  return drawer;
};

/**
 * Open a drawer with the specified effect and direction
 * @param effect The drawer effect
 * @param direction The drawer direction
 */
export const openNavigationDrawer = (
  effect: DrawerEffect = "slide",
  direction: DrawerDirection = "left"
): void => {
  // Create drawer
  const drawer = createNavigationDrawer(effect, direction);
  document.body.appendChild(drawer);

  // Create overlay
  const overlay = createDrawerOverlay();
  document.body.appendChild(overlay);

  // Show drawer after a small delay to allow for transition
  setTimeout(() => {
    drawer.classList.add("active");

    // Apply push effect if needed
    if (effect === "push") {
      const mainContent = document.querySelector("main");
      if (mainContent) {
        (mainContent as HTMLElement).style.transition = "transform 0.3s ease";

        if (direction === "left") {
          (mainContent as HTMLElement).style.transform = "translateX(300px)";
        } else if (direction === "right") {
          (mainContent as HTMLElement).style.transform = "translateX(-300px)";
        } else if (direction === "top") {
          (mainContent as HTMLElement).style.transform = "translateY(300px)";
        }
      }
    }
  }, 10);

  // Attach close handlers
  attachDrawerCloseHandlers(drawer, overlay);
};

/**
 * Create a click handler for navigation icons
 * @returns The click event handler
 */
export const createNavIconClickHandler = (): ((event: Event) => void) => {
  return (event: Event) => {
    event.preventDefault();

    // Send message to open the navigation icon settings
    window.parent.postMessage(
      {
        type: "HEADER_SETTING_SELECTED",
        settingId: "nav_icon",
        submenu: "Navigation Icon",
        itemType: "nav_icon",
        source: "nav-icon-click",
        timestamp: Date.now(),
        directNav: true,
      },
      "*"
    );

    // Get the drawer settings from the clicked nav icon
    const container = (event.currentTarget as HTMLElement).closest(
      ".nav-icon-container"
    );
    if (!container) return;

    const drawerEffect =
      container.getAttribute("data-drawer-effect") || "slide";
    const drawerDirection =
      container.getAttribute("data-drawer-direction") || "left";

    // Open the drawer
    openNavigationDrawer(
      drawerEffect as DrawerEffect,
      drawerDirection as DrawerDirection
    );
  };
};

/**
 * Attach click listeners to all navigation icons
 * @param handler The click event handler
 */
export const attachNavIconListeners = (
  handler: (event: Event) => void
): void => {
  // Find all navigation icons
  const navIcons = document.querySelectorAll('[data-item-id="nav_icon"]');

  // Add click event listeners
  navIcons.forEach((navIcon) => {
    // First remove any existing click listeners
    navIcon.removeEventListener("click", handler);
    // Then add the click event listener
    navIcon.addEventListener("click", handler);
  });
};
