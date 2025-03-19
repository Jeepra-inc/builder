import { Type } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define the block types
export type BlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "video"
  | "button"
  | "divider"
  | "spacer"
  | "card"
  | "html";

// Define a block interface
export interface Block {
  id: string;
  type: BlockType;
  content: any;
  settings?: Record<string, any>;
}

// Block registry entry interface
export interface BlockRegistryEntry {
  name: string;
  icon: React.ElementType;
  createDefault: () => Block;
}

// Create the registry as a simple object for now
export const BlockRegistry: Record<BlockType, BlockRegistryEntry> = {
  paragraph: {
    name: "Paragraph",
    icon: Type, // Use a Lucide icon
    createDefault: () => ({
      id: uuidv4(),
      type: "paragraph",
      content: "Add your text here",
      settings: {
        fontSize: "base",
        fontWeight: "normal",
        textAlign: "left",
      },
    }),
  },
  heading: {
    name: "Heading",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "heading",
      content: "Add your heading here",
      settings: {
        level: "h2",
        fontSize: "2xl",
        fontWeight: "bold",
        textAlign: "left",
      },
    }),
  },
  image: {
    name: "Image",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "image",
      content: {
        src: "/placeholder-image.jpg",
        alt: "Image description",
      },
      settings: {
        width: "100%",
        height: "auto",
        display: "block",
      },
    }),
  },
  video: {
    name: "Video",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "video",
      content: {
        src: "",
        type: "youtube",
      },
      settings: {
        width: "100%",
        aspectRatio: "16/9",
      },
    }),
  },
  button: {
    name: "Button",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "button",
      content: "Click me",
      settings: {
        variant: "primary",
        size: "medium",
        url: "#",
        openInNewTab: false,
      },
    }),
  },
  divider: {
    name: "Divider",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "divider",
      content: null,
      settings: {
        style: "solid",
        width: "100%",
        thickness: 1,
        color: "#eaeaea",
      },
    }),
  },
  spacer: {
    name: "Spacer",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "spacer",
      content: null,
      settings: {
        height: 20,
      },
    }),
  },
  card: {
    name: "Card",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "card",
      content: "",
      settings: {
        padding: "4",
        border: true,
        shadow: "sm",
        rounded: "md",
      },
    }),
  },
  html: {
    name: "HTML",
    icon: Type,
    createDefault: () => ({
      id: uuidv4(),
      type: "html",
      content: "<div>Custom HTML goes here</div>",
      settings: {},
    }),
  },
};

// Helper function to create a default block
export const createDefaultBlock = (type: BlockType): Block => {
  return BlockRegistry[type].createDefault();
};
