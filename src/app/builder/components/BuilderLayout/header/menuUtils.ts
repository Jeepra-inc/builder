// Add function to generate HTML for different menu types
export const generateMenuHTML = (
  menuType: string,
  items: any[] = []
): string => {
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  switch (menuType) {
    case "mainMenu":
      return `<nav class="main-menu">
        <ul class="flex gap-6">
          ${safeItems
            .map(
              (item) => `
            <li class="${
              item.isButton
                ? "bg-primary text-white px-4 py-2 rounded-md"
                : "hover:text-primary"
            } cursor-pointer">
              ${item.text}
              ${
                item.children && item.children.length > 0
                  ? `
                <ul class="absolute hidden group-hover:block bg-white shadow-md mt-2 p-2 rounded-md z-10">
                  ${item.children
                    .map(
                      (child: any) => `
                    <li class="hover:text-primary py-1 cursor-pointer">${child.text}</li>
                  `
                    )
                    .join("")}
                </ul>
              `
                  : ""
              }
            </li>
          `
            )
            .join("")}
        </ul>
      </nav>`;

    case "topBarMenu":
      return `<div class="top-bar-menu">
        <ul class="flex gap-3 text-sm">
          ${safeItems
            .map(
              (item) => `
            <li class="hover:underline cursor-pointer">${item.text}</li>
          `
            )
            .join("")}
        </ul>
      </div>`;

    case "bottomMenu":
      return `<div class="bottom-bar-menu">
        <ul class="flex gap-4 text-sm">
          ${safeItems
            .map(
              (item) => `
            <li class="hover:underline cursor-pointer">${item.text}</li>
          `
            )
            .join("")}
        </ul>
      </div>`;

    default:
      return "";
  }
};
