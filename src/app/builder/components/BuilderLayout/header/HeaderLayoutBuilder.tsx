"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  createContext,
  useMemo,
} from "react";
import "./HeaderLayoutBuilder.css";
import { Button } from "@/components/ui/button";
import { getAllHeaderItems } from "../data/headerItems";
import { presetLayouts } from "../data/headerPresets";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Info, Settings } from "lucide-react";
import { HeaderItem } from "../data/headerItems";
import { HeaderLayout } from "./types";

// Define the layout context type
interface LayoutContextType {
  layout: HeaderLayout;
  setLayout: React.Dispatch<React.SetStateAction<HeaderLayout>>;
}

// Utility function to sanitize a layout and ensure no duplicates
const sanitizeLayout = (layout: HeaderLayout): HeaderLayout => {
  // Deep clone the layout to avoid reference issues
  const newLayout: HeaderLayout = JSON.parse(JSON.stringify(layout));

  // Define layout container IDs for reuse
  const containerIds = [
    "top_left",
    "top_center",
    "top_right",
    "middle_left",
    "middle_center",
    "middle_right",
    "bottom_left",
    "bottom_center",
    "bottom_right",
  ];

  // Remove duplicates within each container
  containerIds.forEach((containerId) => {
    const container = newLayout[containerId as keyof HeaderLayout] as string[];
    const uniqueItems = Array.from(new Set(container));
    newLayout[containerId as keyof HeaderLayout] = uniqueItems;
  });

  // Check for items that exist in multiple containers and keep only the first occurrence
  const itemLocations = new Map<string, string>();

  containerIds.forEach((containerId) => {
    const container = [
      ...(newLayout[containerId as keyof HeaderLayout] as string[]),
    ];

    // Filter the container to keep only items that haven't been seen before
    // or items that are in this container first
    newLayout[containerId as keyof HeaderLayout] = container.filter((item) => {
      if (!itemLocations.has(item)) {
        // First time seeing this item, keep it and record its location
        itemLocations.set(item, containerId);
        return true;
      }
      // Item already exists elsewhere, remove it from here
      return false;
    });
  });

  // Rebuild the available items list
  const allPossibleItems = getAllHeaderItems().map((item) => item.id);
  const usedItems = Array.from(itemLocations.keys());

  // Set available items to all possible items minus those in use
  newLayout.available = allPossibleItems.filter(
    (item) => !usedItems.includes(item)
  );

  return newLayout;
};

// Create the layout context
const LayoutContext = createContext<LayoutContextType>({
  layout: presetLayouts.preset1,
  setLayout: () => {},
});

interface HeaderLayoutBuilderProps {
  onShowPresets?: () => void;
  onShowHeaderMain?: () => void;
  isOpen: boolean;
  onClose: () => void;
  contentRef: React.RefObject<HTMLIFrameElement | null>;
  currentPreset?: string;
  onSettingSelect?: (settingId: string) => void;
  onSwitchToDesign?: () => void;
  onOpenLayoutPanel: () => void;
  onSelectPreset?: (presetId: string) => void;
}

// Define item types for drag and drop
const ItemTypes = {
  HEADER_ITEM: "headerItem",
};

// Map header items to their corresponding settings panels
const itemToSettingsMap = {
  // HTML blocks
  html_block_1: { targetTab: "Header", targetSubmenu: "HTML" },
  html_block_2: { targetTab: "Header", targetSubmenu: "HTML" },
  html_block_3: { targetTab: "Header", targetSubmenu: "HTML" },
  html_block_4: { targetTab: "Header", targetSubmenu: "HTML" },
  html_block_5: { targetTab: "Header", targetSubmenu: "HTML" },

  // Logo
  logo: { targetTab: "Header", targetSubmenu: "Header Main Setting" },

  // Navigation menus have been removed as we don't want settings for them

  // Search
  search: { targetTab: "Header", targetSubmenu: "Header Search Setting" },

  // Buttons
  button_1: { targetTab: "Header", targetSubmenu: "Buttons" },
  button_2: { targetTab: "Header", targetSubmenu: "Buttons" },
  buttons: { targetTab: "Header", targetSubmenu: "Buttons" },

  // Top bar
  topBar: { targetTab: "Header", targetSubmenu: "Top Bar Setting" },

  // Header sections
  headerMain: { targetTab: "Header", targetSubmenu: "Header Main Setting" },
  headerBottom: { targetTab: "Header", targetSubmenu: "Header Bottom Setting" },

  // Account
  account: { targetTab: "Header", targetSubmenu: "Account Setting" },

  // Cart
  cart: { targetTab: "Header", targetSubmenu: "Buttons" },
};

// Define interface for DraggableItem props
interface DraggableItemProps {
  item: {
    id: string;
    type?: string;
    label?: string;
    icon?: string;
    [key: string]: any; // For any additional properties
  };
  index: number;
  moveItem: (
    dragIndex: number,
    hoverIndex: number,
    sourceContainer: string,
    targetContainer: string
  ) => void;
  containerId: string;
  onItemClick?: (itemId: string) => void;
}

// Draggable item component
const DraggableItem = ({
  item,
  index,
  moveItem,
  containerId,
  onItemClick,
}: DraggableItemProps) => {
  // Check if the item is a logo - we want to make it non-draggable
  const isLogo = item.id === "logo";
  // Check if this item is in the available items container
  const isInAvailableItems = containerId === "available";
  // Check if this is a menu item (for which we don't want to show settings)
  const isMenuType =
    item.id === "mainMenu" ||
    item.id === "topBarMenu" ||
    item.id === "bottomMenu";

  // Only allow dragging if it's not a logo
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.HEADER_ITEM,
    item: () => {
      return {
        id: item.id,
        item,
        index,
        containerId,
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    // Make logo non-draggable
    canDrag: !isLogo,
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
    },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.HEADER_ITEM,
    hover(
      item: {
        id: string;
        index: number;
        containerId: string;
        item: HeaderItem;
      },
      monitor
    ) {
      if (!drag) {
        return;
      }

      // Skip hover handling for logo items
      if (isLogo) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;
      const dragContainerId = item.containerId;
      const hoverContainerId = containerId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragContainerId === hoverContainerId) {
        return;
      }

      // Get the bounding rectangle of the hover target
      const hoverBoundingRect = dragRef.current?.getBoundingClientRect();
      if (!hoverBoundingRect) {
        return;
      }

      // Get the middle of the item
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex, dragContainerId, hoverContainerId);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.containerId = hoverContainerId;
    },
  });

  // Create a ref for the drag element
  const dragRef = useRef<HTMLDivElement | null>(null);

  // Connect both drag and drop refs
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      dragRef.current = node;
      drag(node);
      drop(node);
    },
    [drag, drop]
  );

  return (
    <div
      ref={ref}
      className={`px-4 py-2 rounded text-xs ${
        isLogo ? "bg-yellow-100 border border-yellow-500" : "bg-blue-100"
      } 
        ${
          isLogo ? "cursor-default w-auto inline-block" : "cursor-move"
        } select-none whitespace-nowrap 
        ${isDragging ? "opacity-50" : ""} flex items-center gap-1 shrink-0
        h-[28px] my-1`}
      onClick={() => {
        // Only allow click to open settings if not in available items and not a menu item
        if (!isInAvailableItems && !isMenuType && onItemClick) {
          onItemClick(item.id);
        }
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: isLogo ? "fit-content" : "auto",
      }}
    >
      <div className="flex items-center justify-between w-full gap-1">
        <div>{item.builderLabel || item.label}</div>
        {!isInAvailableItems && !isLogo && !isMenuType && (
          <Settings size={13} />
        )}
      </div>
    </div>
  );
};

// Define interface for DroppableZone props
interface DroppableZoneProps {
  id: string;
  items: string[];
  moveItem: (
    dragIndex: number,
    hoverIndex: number,
    sourceContainer: string,
    targetContainer: string
  ) => void;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

// Droppable zone component
const DroppableZone = ({
  id,
  items,
  moveItem,
  onItemClick,
  className = "",
}: DroppableZoneProps) => {
  // Get access to the layout state from the parent component
  // This is needed for the drop handler
  const { layout, setLayout } = React.useContext(LayoutContext);
  // Check if this container has a logo item
  const hasLogo = items.includes("logo");

  // Check if this is a top row container
  const isTopRow = id.startsWith("top_");

  // Create the drop ref conditionally based on whether this container has a logo
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.HEADER_ITEM,
    canDrop: (item) => {
      // Always block drops in logo containers
      if (hasLogo) {
        return false;
      }
      // Prevent dropping a logo into any area that already has items
      if (item.id === "logo" && items.length > 0) {
        return false;
      }
      return true;
    },
    drop: (droppedItem: { id: string; containerId: string; index: number }) => {
      // Triple-check to prevent drops in logo containers
      if (hasLogo) {
        return { name: id };
      }

      // Prevent drops of logo items
      if (droppedItem.id === "logo") {
        // Special case: Only allow logo drops in empty containers
        if (items.length > 0) {
          return { name: id };
        }
      }

      // If the item is dropped but not from a hover event (i.e., a new item from available)
      if (droppedItem.containerId !== id) {
        // Check if this is a drop from the available items container
        if (droppedItem.containerId === "available") {
          // For available items, we need to use the item.id directly
          // This is the most reliable way to get the correct item ID
          if (droppedItem.id) {
            // Create a new version of the layout with the item added to this container
            setLayout((prevLayout) => {
              const newLayout: HeaderLayout = { ...prevLayout };
              const newTargetContainer = [
                ...(prevLayout[id as keyof HeaderLayout] || []),
              ];
              // Check if the item already exists in the target container
              if (newTargetContainer.includes(droppedItem.id)) {
                return prevLayout; // Prevent adding duplicate
              }
              newTargetContainer.push(droppedItem.id);
              newLayout[id as keyof HeaderLayout] = newTargetContainer;
              return newLayout;
            });

            // Return early since we've handled this case specially
            return { name: id };
          }
        }

        // For non-available containers, use the standard moveItem function
        moveItem(
          droppedItem.index,
          items.length, // Add to the end of this container
          droppedItem.containerId,
          id
        );
      }
      return { name: id };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Calculate specific styles for different containers
  // Initialize container style with properties for filling available space first, then expanding
  const containerStyle: React.CSSProperties = {
    minWidth: hasLogo ? "fit-content" : "0",
    width: hasLogo ? "auto" : "100%",
    flex: hasLogo ? "0 0 auto" : "1 1 auto",
    maxWidth: "none",
  };

  // Special styling for logo containers
  if (hasLogo) {
    containerStyle.width = "fit-content";
    containerStyle.minWidth = "120px"; // Minimum width for logo container
    containerStyle.justifySelf = "start"; // Align to start of grid cell
    containerStyle.maxWidth = "25%"; // Prevent logo from taking too much space
  } else {
    // For non-logo containers, ensure they expand to fill space
    containerStyle.width = "100%";
    containerStyle.minWidth = "0"; // Allow shrinking to accommodate other elements
  }

  // Center alignment for center columns
  if (id.includes("center")) {
    containerStyle.justifySelf = "stretch"; // Stretch to fill the cell
    containerStyle.textAlign = "center"; // Center the content
  }

  // Right alignment for right columns
  if (id.includes("right")) {
    containerStyle.justifySelf = "end";
  }

  // Special styling for available items
  if (id === "available") {
    containerStyle.width = "100%";
    containerStyle.background = "rgba(0, 0, 0, 0.2)";
    containerStyle.border = "none";
    containerStyle.minHeight = "60px";
    containerStyle.justifySelf = "stretch";
    // Allow wrapping for the available items section
    containerStyle.flexWrap = "wrap";
  }

  // Determine flexbox justification based on position
  const justifyClass = id.includes("center")
    ? "justify-center"
    : id.includes("right")
    ? "justify-end"
    : "justify-start";

  // Create a ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a callback ref to merge the container ref and drop ref
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Update the container ref
      containerRef.current = node;

      // Only apply the drop ref if this container doesn't have a logo
      if (!hasLogo) {
        drop(node);
      }
    },
    [drop, hasLogo]
  );

  return (
    <div
      ref={mergedRef}
      className={`drop-target px-1 relative
                 ${
                   isOver && canDrop
                     ? "bg-zinc-800"
                     : hasLogo
                     ? "bg-zinc-700"
                     : "bg-zinc-900"
                 } 
                  ${
                    id === "available"
                      ? ""
                      : `border ${
                          isOver && canDrop
                            ? "border-blue-500"
                            : hasLogo
                            ? "border-yellow-500"
                            : "border-dashed border-gray-300"
                        }`
                  } 
                 rounded shadow-sm min-h-[40px] flex gap-2 items-center ${justifyClass}
                 ${hasLogo ? "cursor-not-allowed" : ""}
                 whitespace-nowrap
                 ${className}`}
      title={
        hasLogo
          ? "This area contains a logo and cannot be modified by the preset layout"
          : ""
      }
    >
      {/* Add info icon for logo containers */}
      {hasLogo && (
        <>
          {/* Add protective overlay to completely block interaction */}
          <div
            className="absolute inset-0 bg-transparent z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />

          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center z-20">
            <Info size={13} />
          </div>
        </>
      )}
      {items.map((itemId, index) => {
        const item = getAllHeaderItems().find((i) => i.id === itemId);
        if (!item) return null;

        return (
          <DraggableItem
            key={`${itemId}_${index}`} // Update key to ensure uniqueness
            item={item}
            index={index}
            containerId={id}
            moveItem={moveItem}
            onItemClick={onItemClick}
          />
        );
      })}
    </div>
  );
};

// Define the type for the layout structure
// interface HeaderLayout has been moved to types.ts

export function HeaderLayoutBuilder({
  isOpen,
  onClose,
  contentRef,
  currentPreset: initialPreset = "preset1",
  onOpenLayoutPanel,
  onSelectPreset,
}: HeaderLayoutBuilderProps) {
  // Use a ref to track if this is the initial render
  const isInitialMount = useRef(true);

  // Add local state for current preset
  const [currentPreset, setCurrentPreset] = useState(initialPreset);

  // Function to check if localStorage has saved header layout settings
  const getSavedLayout = () => {
    try {
      const savedSettingsStr = localStorage.getItem("visual-builder-settings");
      if (savedSettingsStr) {
        const savedSettings = JSON.parse(savedSettingsStr);

        // Check if we have a saved layout in the header settings
        if (savedSettings?.headerSettings?.layout?.containers) {
          return savedSettings.headerSettings.layout.containers;
        }
      }
    } catch (error) {
      console.error("Error loading saved layout:", error);
    }
    return null;
  };

  // Initialize layout state with saved layout if available, otherwise use preset
  const [layoutState, setLayoutState] = useState<HeaderLayout>(() => {
    const savedLayout = getSavedLayout();
    if (savedLayout) {
      return sanitizeLayout(savedLayout);
    }
    return sanitizeLayout({
      ...(presetLayouts[currentPreset as keyof typeof presetLayouts] ||
        presetLayouts.preset1),
      available: getAllHeaderItems().map((item) => item.id), // Initialize available items
    });
  });

  // Create a safe setter for layout that always sanitizes the data
  const setLayout = useCallback(
    (
      layoutOrFunction: HeaderLayout | ((prev: HeaderLayout) => HeaderLayout)
    ) => {
      setLayoutState((prevLayout) => {
        // If layoutOrFunction is a function, call it with the previous layout
        const newLayoutBeforeSanitize =
          typeof layoutOrFunction === "function"
            ? layoutOrFunction(prevLayout)
            : layoutOrFunction;

        // Always sanitize the layout before setting it
        return sanitizeLayout(newLayoutBeforeSanitize);
      });
    },
    []
  );

  // Create a combined layout state for use in the component
  const layout = useMemo(() => sanitizeLayout(layoutState), [layoutState]);

  // Store the current preset to use for comparison
  const lastPresetRef = useRef<string>(currentPreset);

  // Consolidate logging for layout changes
  const logLayoutChange = (presetId: string, layout: HeaderLayout) => {
    console.log(
      `HeaderLayoutBuilder: Layout changed to preset ${presetId}`,
      layout
    );
  };

  // Helper function to update the iframe layout without user interaction
  // This now runs automatically whenever the layout changes or when changing presets
  // The Apply Layout button has been removed to simplify the user experience
  const applyLayoutToIframe = useCallback(() => {
    if (currentPreset) {
      console.log("Updating header layout in iframe:", {
        type: "UPDATE_HEADER_LAYOUT",
        presetId: currentPreset,
      });

      // Send message to iframe to update the header layout using the current layout state
      contentRef.current?.contentWindow?.postMessage(
        {
          type: "UPDATE_HEADER_LAYOUT",
          presetId: currentPreset,
          ...layout, // Use the current layout state
        },
        "*"
      );

      // Dispatch an event to notify about the layout change (but not saved)
      window.dispatchEvent(
        new CustomEvent("headerLayoutChanged", {
          detail: {
            layout: layout,
            presetId: currentPreset,
            unsaved: true,
          },
        })
      );
    }
  }, [contentRef, currentPreset, layout]);

  // Add a function to save the current layout when triggered by Save button
  const saveCurrentLayout = useCallback(() => {
    if (currentPreset) {
      // Dispatch an event to parent to save these changes
      window.dispatchEvent(
        new CustomEvent("saveHeaderLayout", {
          detail: {
            layout: layout,
            presetId: currentPreset,
          },
        })
      );
      console.log("Layout changes ready to be saved:", layout);
    }
  }, [currentPreset, layout]);

  // Expose the saveCurrentLayout function to the parent component
  // This allows the save button to trigger the save action
  useEffect(() => {
    // Listen for save events from the parent
    const handleSaveRequest = () => {
      saveCurrentLayout();
    };

    window.addEventListener("requestSaveHeaderLayout", handleSaveRequest);

    return () => {
      window.removeEventListener("requestSaveHeaderLayout", handleSaveRequest);
    };
  }, [saveCurrentLayout]);

  // Update local layout state when currentPreset changes, but handle with care
  useEffect(() => {
    // First check if this is an initial mount vs. an actual preset change
    if (isInitialMount.current) {
      // Try to get saved layout again to double-check it's loaded
      const savedLayout = getSavedLayout();
      if (savedLayout) {
        setLayout(sanitizeLayout(savedLayout));
      } else if (presetLayouts[currentPreset as keyof typeof presetLayouts]) {
        // If no saved layout, use the current preset instead
        setLayout(
          sanitizeLayout(
            presetLayouts[currentPreset as keyof typeof presetLayouts]
          )
        );
      }

      isInitialMount.current = false;
      lastPresetRef.current = currentPreset;
      // Apply the initial layout to the iframe
      setTimeout(() => applyLayoutToIframe(), 100);
      return;
    }

    // This is an actual preset change initiated by the user (not a page reload)
    // Only update if the preset actually changed (not on a re-render)
    if (currentPreset !== lastPresetRef.current) {
      console.log(
        `HeaderLayoutBuilder: Changing preset from ${lastPresetRef.current} to ${currentPreset}`
      );

      if (presetLayouts[currentPreset as keyof typeof presetLayouts]) {
        // Record that user explicitly chose a preset, then apply it
        const newLayout = sanitizeLayout(
          presetLayouts[currentPreset as keyof typeof presetLayouts]
        );

        setLayout(newLayout);
        console.log("Applied new layout from preset:", newLayout);

        // Immediately apply this layout to the iframe and save it
        // This ensures the new preset is saved and persists on reload
        setTimeout(() => {
          applyLayoutToIframe();
          console.log("Applied layout to iframe after preset change");
        }, 100);

        // If onSelectPreset callback exists, call it
        if (onSelectPreset) {
          onSelectPreset(currentPreset);
        }
      }

      // Update ref for next comparison
      lastPresetRef.current = currentPreset;
    }
  }, [currentPreset, applyLayoutToIframe, setLayout, onSelectPreset]);

  // Apply the layout to the iframe whenever it changes
  useEffect(() => {
    if (isOpen && contentRef.current) {
      applyLayoutToIframe();
      logLayoutChange(currentPreset, layout);
    }
  }, [layout, isOpen, applyLayoutToIframe]);

  // Listen for layout updates from iframe or parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "HEADER_LAYOUT_UPDATED") {
        const { presetId } = event.data;
        if (
          presetId &&
          presetLayouts[presetId as keyof typeof presetLayouts] &&
          presetId !== currentPreset
        ) {
          // Update both currentPreset and layout
          setCurrentPreset(presetId);
          setLayout(
            sanitizeLayout(
              presetLayouts[presetId as keyof typeof presetLayouts]
            )
          );
        }
      }
    };

    // Listen for direct preset change events from the sidebar or page
    const handlePresetChanged = (event: CustomEvent) => {
      const { presetId } = event.detail;
      console.log(
        "HeaderLayoutBuilder received preset change event:",
        presetId
      );

      if (presetId && presetId !== currentPreset) {
        console.log(
          `HeaderLayoutBuilder: Updating preset from ${currentPreset} to ${presetId}`
        );

        // Update currentPreset state
        setCurrentPreset(presetId);

        // Update layout if the preset exists
        if (presetLayouts[presetId as keyof typeof presetLayouts]) {
          const newLayout = sanitizeLayout(
            presetLayouts[presetId as keyof typeof presetLayouts]
          );

          setLayout(newLayout);
          console.log(
            "HeaderLayoutBuilder: Applied new layout from preset event:",
            newLayout
          );

          // Apply to iframe immediately
          setTimeout(() => {
            applyLayoutToIframe();
            console.log(
              "HeaderLayoutBuilder: Applied layout to iframe after preset change event"
            );
          }, 100);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener(
      "headerPresetChanged",
      handlePresetChanged as EventListener
    );

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener(
        "headerPresetChanged",
        handlePresetChanged as EventListener
      );
    };
  }, [currentPreset, setLayout, applyLayoutToIframe]);

  const handleItemClick = useCallback((itemId: string) => {
    // Skip settings for menu items
    if (
      itemId === "mainMenu" ||
      itemId === "topBarMenu" ||
      itemId === "bottomMenu"
    ) {
      return; // Early return to prevent settings from opening
    }

    // Find the appropriate settings panel for this item
    const settingsInfo =
      itemToSettingsMap[itemId as keyof typeof itemToSettingsMap];

    if (settingsInfo) {
      // Dispatch event to switch to the appropriate settings panel
      window.dispatchEvent(
        new CustomEvent("switchTab", {
          detail: {
            targetTab: settingsInfo.targetTab,
            targetSubmenu: settingsInfo.targetSubmenu,
          },
        })
      );
    } else {
      // Default to HTML settings for HTML blocks (fallback)
      if (itemId.startsWith("html_block_")) {
        window.dispatchEvent(
          new CustomEvent("switchTab", {
            detail: {
              targetTab: "Header",
              targetSubmenu: "HTML",
              settingId: itemId,
            },
          })
        );
      }
    }
  }, []);

  const moveItem = useCallback(
    (
      sourceIndex: number,
      targetIndex: number,
      sourceContainerId: string,
      targetContainerId: string
    ) => {
      setLayout((prevLayout: HeaderLayout) => {
        // Get a reference to the source container
        const sourceContainer =
          prevLayout[sourceContainerId as keyof HeaderLayout] || [];

        // Get the item being moved
        const itemToMove = sourceContainer[sourceIndex];

        // If item doesn't exist, don't proceed
        if (!itemToMove) return prevLayout;

        // Create a new layout with initial changes
        const newLayout: HeaderLayout = JSON.parse(JSON.stringify(prevLayout));

        // Define layout container IDs for reuse
        const containerIds = [
          "top_left",
          "top_center",
          "top_right",
          "middle_left",
          "middle_center",
          "middle_right",
          "bottom_left",
          "bottom_center",
          "bottom_right",
        ];

        // SPECIAL CASE: If moving within the same container, just reorder the items
        if (
          sourceContainerId === targetContainerId &&
          sourceContainerId !== "available"
        ) {
          const container = [
            ...(newLayout[sourceContainerId as keyof HeaderLayout] as string[]),
          ];

          // Remove from original position
          container.splice(sourceIndex, 1);

          // Add at new position
          container.splice(targetIndex, 0, itemToMove);

          // Update the container
          newLayout[sourceContainerId as keyof HeaderLayout] = container;

          // No need to update available items when just reordering
          return newLayout;
        }

        // SPECIAL CASE: If moving from a layout container to another layout container
        // (not involving the available items container)
        if (
          containerIds.includes(sourceContainerId) &&
          containerIds.includes(targetContainerId)
        ) {
          // Remove the item from ALL containers except the source to prevent duplicates
          containerIds.forEach((containerId) => {
            if (containerId !== sourceContainerId) {
              newLayout[containerId as keyof HeaderLayout] = (
                newLayout[containerId as keyof HeaderLayout] as string[]
              ).filter((item) => item !== itemToMove);
            }
          });

          // Remove from source container
          const sourceContainerUpdated = [
            ...(newLayout[sourceContainerId as keyof HeaderLayout] as string[]),
          ];
          sourceContainerUpdated.splice(sourceIndex, 1);
          newLayout[sourceContainerId as keyof HeaderLayout] =
            sourceContainerUpdated;

          // Add to target container
          const targetContainer = [
            ...(newLayout[targetContainerId as keyof HeaderLayout] as string[]),
          ];
          targetContainer.splice(targetIndex, 0, itemToMove);
          newLayout[targetContainerId as keyof HeaderLayout] = targetContainer;

          // Keep the available items unchanged in this case
          return newLayout;
        }

        // CASE: Moving from available to a layout container
        if (sourceContainerId === "available") {
          // Remove from all layout containers to prevent duplicates
          containerIds.forEach((containerId) => {
            newLayout[containerId as keyof HeaderLayout] = (
              newLayout[containerId as keyof HeaderLayout] as string[]
            ).filter((item) => item !== itemToMove);
          });

          // Add to target container
          const targetContainer = [
            ...(newLayout[targetContainerId as keyof HeaderLayout] as string[]),
          ];
          targetContainer.splice(targetIndex, 0, itemToMove);
          newLayout[targetContainerId as keyof HeaderLayout] = targetContainer;

          // Remove from available
          newLayout.available = newLayout.available || [];
          newLayout.available = newLayout.available.filter(
            (item) => item !== itemToMove
          );

          return newLayout;
        }

        // CASE: Moving from a layout container to available
        if (targetContainerId === "available") {
          // Remove from all layout containers
          containerIds.forEach((containerId) => {
            newLayout[containerId as keyof HeaderLayout] = (
              newLayout[containerId as keyof HeaderLayout] as string[]
            ).filter((item) => item !== itemToMove);
          });

          // Add to available if not already there
          newLayout.available = newLayout.available || [];
          if (!newLayout.available.includes(itemToMove)) {
            newLayout.available.push(itemToMove);
          }

          return newLayout;
        }

        // If we get here, something unexpected happened - fall back to sanitization
        // to ensure the layout is consistent
        const allPossibleItems = getAllHeaderItems().map((item) => item.id);
        const usedItems = new Set<string>();

        // Collect all items currently in use in any layout container
        containerIds.forEach((containerId) => {
          const containerItems = newLayout[
            containerId as keyof HeaderLayout
          ] as string[];
          containerItems.forEach((item) => usedItems.add(item));
        });

        // Set available items to all possible items minus those in use
        newLayout.available = allPossibleItems.filter(
          (item) => !usedItems.has(item)
        );

        return newLayout;
      });
    },
    [setLayout]
  );

  // Add debug logging when component is opened
  useEffect(() => {
    if (isOpen) {
      console.log("HeaderLayoutBuilder OPENED - checking for live settings...");

      // Listen for direct header settings from the parent component
      const handleHeaderSettings = (event: CustomEvent) => {
        console.log("Received response from parent:", event.detail);

        // Check if we received the current preset from parent
        if (
          event.detail?.currentPreset &&
          event.detail.currentPreset !== currentPreset
        ) {
          console.log(
            "Updating current preset from",
            currentPreset,
            "to",
            event.detail.currentPreset
          );
          // Update currentPreset state
          setCurrentPreset(event.detail.currentPreset);

          // Update layout with the new preset
          if (
            presetLayouts[
              event.detail.currentPreset as keyof typeof presetLayouts
            ]
          ) {
            setLayout(
              sanitizeLayout(
                presetLayouts[
                  event.detail.currentPreset as keyof typeof presetLayouts
                ]
              )
            );
          }
        }

        // Check if we have layout containers in the response
        if (event.detail?.headerSettings?.layout?.containers) {
          console.log("Received LIVE layout containers from parent");

          // Check if received settings match current layout
          const currentLayoutJSON = JSON.stringify(layout);
          const receivedLayoutJSON = JSON.stringify(
            event.detail.headerSettings.layout.containers
          );

          if (currentLayoutJSON !== receivedLayoutJSON) {
            console.log(
              "Layout MISMATCH between builder and live settings - updating builder"
            );
            // Update layout with the current settings
            setLayout(
              sanitizeLayout(event.detail.headerSettings.layout.containers)
            );
          } else {
            console.log("Layout MATCHES between builder and live settings");
          }
        } else {
          console.log("Received response but no layout containers found");
        }
      };

      // Request current header settings from the parent component
      window.dispatchEvent(new CustomEvent("requestHeaderSettings"));
      console.log("Sent request for current header settings");

      // Add event listener for header settings response
      window.addEventListener(
        "provideHeaderSettings",
        handleHeaderSettings as EventListener
      );

      // Debug info about current state
      const savedString = localStorage.getItem("visual-builder-settings");
      const savedData = savedString ? JSON.parse(savedString) : null;
      const savedLayout = savedData?.headerSettings?.layout?.containers;

      console.log("HeaderLayoutBuilder debug info:", {
        currentPreset,
        hasLayout: !!layout,
        layoutContainers: Object.keys(layout),
        savedLayoutAvailable: !!savedLayout,
        savedSettings: savedData ? "available" : "not found",
      });

      return () => {
        window.removeEventListener(
          "provideHeaderSettings",
          handleHeaderSettings as EventListener
        );
      };
    }
  }, [isOpen, currentPreset, layout]);

  // Ensure layout state is ready to be saved when the save button is clicked
  const handleSave = useCallback(() => {
    // Logic to save the current layout state
    const layoutToSave = sanitizeLayout(layoutState);
    localStorage.setItem(
      "visual-builder-settings",
      JSON.stringify({
        headerSettings: {
          layout: {
            containers: layoutToSave,
          },
        },
      })
    );
    console.log("Layout saved successfully:", layoutToSave);
  }, [layoutState]);

  if (!isOpen) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <LayoutContext.Provider value={{ layout, setLayout }}>
        <div
          className="z-50 absolute bottom-0 w-full bg-zinc-700"
          style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden" }}
        >
          <div className="flex items-center justify-between p-3 py-2 bg-white border-b border-t mb-2">
            <div>
              <h3 className="font-bold">Header Builder</h3>
              <p className="text-xs text-blue-500 capitalize">
                <strong>{currentPreset}</strong> is selected
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" className="h-8" onClick={onOpenLayoutPanel}>
                Choose Preset
              </Button>
              <span className="flex-grow"></span>
              <Button size="sm" className="h-8" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          <div
            className="flex flex-col gap-2 p-3 w-full"
            style={{ overflowX: "auto", overflowY: "hidden" }}
          >
            {/* Top Row */}
            <div className="relative group">
              {/* Add gear icon with text for top row - only visible on hover */}
              <div
                className="absolute top-0 right-0 -mt-3 -mr-3 bg-blue-500 text-white rounded-md pl-2 pr-3 py-1 flex items-center gap-1 z-30 cursor-pointer hover:bg-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  // Dispatch event to open top bar settings
                  window.dispatchEvent(
                    new CustomEvent("switchTab", {
                      detail: {
                        targetTab: "Header",
                        targetSubmenu: "Top Bar Setting",
                      },
                    })
                  );
                }}
                title="Edit Top Bar Settings"
              >
                <Settings size={13} />
                <span className="text-xs font-medium">Top Bar</span>
              </div>

              {/* Top row outline - only visible on hover */}
              <div
                className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ margin: "-2px" }}
              ></div>

              <div
                className="grid gap-2 w-full flex-grow"
                style={{
                  display: "grid",
                  gridTemplateColumns: `${
                    layout.top_left.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.top_center.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.top_right.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  }`,
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <DroppableZone
                  id="top_left"
                  items={layout.top_left}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="top_center"
                  items={layout.top_center}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="top_right"
                  items={layout.top_right}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
              </div>
            </div>

            {/* Middle Row */}
            <div className="relative group">
              {/* Add gear icon with text for middle row - only visible on hover */}
              <div
                className="absolute top-0 right-0 -mt-3 -mr-3 bg-blue-500 text-white rounded-md pl-2 pr-3 py-1 flex items-center gap-1 z-30 cursor-pointer hover:bg-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  // Dispatch event to open header main settings
                  window.dispatchEvent(
                    new CustomEvent("switchTab", {
                      detail: {
                        targetTab: "Header",
                        targetSubmenu: "Header Main Setting",
                      },
                    })
                  );
                }}
                title="Edit Header Main Settings"
              >
                <Settings size={13} />
                <span className="text-xs font-medium">Main Area</span>
              </div>

              {/* Middle row outline */}
              <div
                className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ margin: "-2px" }}
              ></div>

              <div
                className="grid gap-2 w-full flex-grow"
                style={{
                  display: "grid",
                  gridTemplateColumns: `${
                    layout.middle_left.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.middle_center.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.middle_right.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  }`,
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <DroppableZone
                  id="middle_left"
                  items={layout.middle_left}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="middle_center"
                  items={layout.middle_center}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="middle_right"
                  items={layout.middle_right}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="relative group">
              {/* Add gear icon with text for bottom row - only visible on hover */}
              <div
                className="absolute top-0 right-0 -mt-3 -mr-3 bg-blue-500 text-white rounded-md pl-2 pr-3 py-1 flex items-center gap-1 z-30 cursor-pointer hover:bg-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => {
                  // Dispatch event to open header bottom settings
                  window.dispatchEvent(
                    new CustomEvent("switchTab", {
                      detail: {
                        targetTab: "Header",
                        targetSubmenu: "Header Bottom Setting",
                      },
                    })
                  );
                }}
                title="Edit Header Bottom Settings"
              >
                <Settings size={13} />
                <span className="text-xs font-medium">Bottom Bar</span>
              </div>

              {/* Bottom row outline */}
              <div
                className="absolute inset-0 border-2 border-blue-400 rounded-md pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ margin: "-2px" }}
              ></div>

              <div
                className="grid gap-2 w-full flex-grow"
                style={{
                  display: "grid",
                  gridTemplateColumns: `${
                    layout.bottom_left.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.bottom_center.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  } ${
                    layout.bottom_right.includes("logo")
                      ? "auto"
                      : "minmax(min-content, 1fr)"
                  }`,
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <DroppableZone
                  id="bottom_left"
                  items={layout.bottom_left}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="bottom_center"
                  items={layout.bottom_center}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
                <DroppableZone
                  id="bottom_right"
                  items={layout.bottom_right}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                />
              </div>
            </div>

            {/* Available Items */}
            <div className="flex w-full">
              <div className="w-full">
                <p className="text-xs text-white mb-2 sr-only">
                  Available Items:
                </p>
                <DroppableZone
                  id="available"
                  items={layout.available || []}
                  moveItem={moveItem}
                  onItemClick={handleItemClick}
                  className="available-items"
                />
              </div>
            </div>
          </div>
        </div>
      </LayoutContext.Provider>
    </DndProvider>
  );
}
