# Color Scheme Utilities

This module provides reusable utilities for managing color schemes across
components in the application. It allows you to fetch color schemes from
`settings.json` and apply them to various components without duplicating code.

## Features

- Centralized color scheme fetching and caching
- React hook for component integration
- Utilities for schema integration
- Style generation for direct application

## How to Use

### 1. In a Component with Schema

If you have a component with a schema that needs color scheme options:

```tsx
import { addColorSchemesToSchema } from "@/app/builder/utils/colorSchemeUtils";

// Create the initial schema
export const componentSchema = {
  name: "My Component",
  type: SectionType.Banner,
  schema: [...],
  settings: [
    {
      id: "colorScheme",
      type: "select",
      label: "Color Scheme",
      options: [], // Empty initially, will be populated by the utility
      default: "",
    },
    // Other settings...
  ],
};

// In your component
const MyComponent = () => {
  // Use the useColorScheme hook to get styles
  const { styles, isLoading } = useColorScheme(settings.colorScheme);

  return (
    <div style={styles.background}>
      {isLoading && <div>Loading color schemes...</div>}
      <h1 style={styles.text}>My Component</h1>
      <p style={styles.text}>This content uses the selected color scheme</p>
    </div>
  );
};

// Initialize the schema with color schemes
addColorSchemesToSchema(componentSchema, MyComponent)
  .catch(error => console.error('Failed to add color schemes:', error));

// Attach the schema to the component
MyComponent.schema = componentSchema;
```

### 2. Using the Hook in Any Component

You can use the `useColorScheme` hook in any component:

```tsx
import { useColorScheme } from "@/app/builder/utils/colorSchemeUtils";

const MyComponent = ({ selectedColorScheme }) => {
  const { styles, isLoading, colorSchemes } =
    useColorScheme(selectedColorScheme);

  return (
    <div style={styles.background}>
      <h1 style={styles.text}>Component with Color Scheme</h1>
      <p style={styles.text}>
        This content automatically uses the selected color scheme
      </p>
    </div>
  );
};
```

### 3. Direct Style Application

You can directly apply color scheme styles without the hook:

```tsx
import { getColorSchemeStyles } from "@/app/builder/utils/colorSchemeUtils";

const MyComponent = ({ colorSchemeId }) => {
  const styles = getColorSchemeStyles(colorSchemeId);

  return (
    <div style={styles.background}>
      <h1 style={styles.text}>Direct Style Application</h1>
    </div>
  );
};
```

## API Reference

### `useColorScheme(selectedSchemeId?: string)`

A React hook that provides color scheme information and styles.

**Returns:**

- `styles`: Object with `background` and `text` style objects
- `isLoading`: Boolean indicating if schemes are loading
- `colorSchemes`: Array of all available color schemes

### `addColorSchemesToSchema(schema, component)`

Updates a component schema with available color schemes.

**Parameters:**

- `schema`: The component schema to update
- `component`: The component object with schema property

**Returns:**

- A Promise that resolves to the updated schema

### `getColorSchemeStyles(colorSchemeId)`

Gets style objects for a specific color scheme ID.

**Parameters:**

- `colorSchemeId`: The ID of the color scheme to use

**Returns:**

- Object with `background` and `text` style objects

### `fetchColorSchemes()`

Fetches color schemes from settings.json.

**Returns:**

- A Promise that resolves to an array of ColorScheme objects

## Example

See the `ColorSchemeExample.tsx` component for a comprehensive example of all
three approaches.

## ColorScheme Interface

```typescript
interface ColorScheme {
  id: string;
  name?: string;
  background: string;
  text: string;
  gradient?: string;
}
```
