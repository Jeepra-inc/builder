# Iframe Utilities

This directory contains utility functions extracted from the iframe/page.tsx
file to apply the DRY (Don't Repeat Yourself) principle.

## Available Utilities

### Message Handlers (messageHandlers.ts)

Functions for handling messages in the iframe:

```typescript
// Create a combined message listener with multiple handlers
const messageListener = createMessageListener([
  createBackgroundColorHandler,
  createToggleSectionVisibilityHandler(
    dispatch,
    localSections,
    setLocalSections
  ),
  createLoadSettingsHandler(dispatch, setHeaderSettings, setLocalSections),
]);

// Use the combined handler
window.addEventListener("message", messageListener);
```

### Section Utilities (sectionUtils.ts)

Functions for manipulating sections:

```typescript
// Generate a unique ID
const id = generateUniqueId();

// Move a section
const updatedSections = moveSection(localSections, sectionId, "up");

// Toggle section visibility
const updatedSections = toggleSectionVisibility(localSections, sectionId, true);

// Use reducer helpers
function localSectionsReducer(state, action) {
  if (action.type === "MOVE_SECTION") {
    return handleMoveSectionAction(state, action);
  }
  if (action.type === "TOGGLE_SECTION_VISIBILITY") {
    return handleToggleSectionVisibilityAction(state, action);
  }
  return state;
}
```

### DOM Utilities (domUtils.ts)

Functions for DOM manipulation:

```typescript
// Load a Google font
loadGoogleFont("Roboto", "400,700");

// Extract font family from a CSS value
const fontFamily = extractFontFamily("16px 'Roboto', sans-serif");

// Create a drawer overlay
const overlay = createDrawerOverlay();
document.body.appendChild(overlay);

// Attach close handlers to a drawer
attachDrawerCloseHandlers(drawerElement, overlay);
```

## How to Apply DRY

1. Identify repeated code patterns in the iframe/page.tsx file
2. Check if a utility already exists for that pattern
3. Replace the repeated code with the utility function
4. If no utility exists, consider creating a new one

This approach will make the codebase more maintainable, testable, and easier to
understand.
