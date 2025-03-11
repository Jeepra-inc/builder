import { IframeSection, SectionAction } from "./messageHandlers";

// Create a function to generate unique IDs for sections
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Utility to move a section up or down
export const moveSection = (
  sections: IframeSection[],
  sectionId: string,
  direction: "up" | "down"
): IframeSection[] => {
  const currentIndex = sections.findIndex((s) => s.id === sectionId);
  if (currentIndex === -1) return sections;

  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (newIndex < 0 || newIndex >= sections.length) return sections;

  const updatedSections = [...sections];
  const [removed] = updatedSections.splice(currentIndex, 1);
  updatedSections.splice(newIndex, 0, removed);

  return updatedSections;
};

// Utility to toggle section visibility
export const toggleSectionVisibility = (
  sections: IframeSection[],
  sectionId: string,
  isVisible: boolean
): IframeSection[] => {
  return sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          isVisible: isVisible ?? section.isVisible,
          settings: {
            ...section.settings,
            isVisible: isVisible ?? section.settings?.isVisible ?? true,
          },
        }
      : section
  );
};

// Section reducer functions that can be imported to avoid duplication
export const handleMoveSectionAction = (
  state: { sections: IframeSection[] },
  action: SectionAction
): { sections: IframeSection[] } => {
  if (action.type === "MOVE_SECTION") {
    const { sectionId, direction } = action;
    return {
      ...state,
      sections: moveSection(state.sections, sectionId, direction),
    };
  }
  return state;
};

export const handleToggleSectionVisibilityAction = (
  state: { sections: IframeSection[] },
  action: SectionAction
): { sections: IframeSection[] } => {
  if (action.type === "TOGGLE_SECTION_VISIBILITY") {
    const { sectionId, isVisible } = action;
    return {
      ...state,
      sections: toggleSectionVisibility(state.sections, sectionId, isVisible),
    };
  }
  return state;
};
