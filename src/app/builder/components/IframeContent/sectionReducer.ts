import { SectionType } from '@/app/builder/types';
export type Section = {
  id: string;
  type: SectionType;
  content: any[]; // Changed from string to any[]
  settings: Record<string, any>;
  styles?: Record<string, any>;
  isVisible?: boolean;
};

export type SectionAction =
  | { type: 'SET_SECTIONS'; payload: Section[] }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Record<string, any> }
  | { type: 'ADD_SECTION'; payload: Section; index?: number }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'TOGGLE_SECTION_VISIBILITY'; sectionId: string; isVisible: boolean }
  | { type: 'REORDER_SECTIONS'; sectionId: string; blocks: any[] }
  | { type: 'MOVE_SECTION'; sectionId: string; direction: 'up' | 'down' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export type SectionState = {
  sections: Section[];
  history: Section[][];
  historyIndex: number;
};

// ---------------------- Initial State ----------------------
export const initialSectionState: SectionState = {
  sections: [],
  history: [[]],
  historyIndex: 0,
};

// ---------------------- Reducer ----------------------
export function sectionsReducer(
  state: SectionState,
  action: SectionAction
): SectionState {
  switch (action.type) {
    case 'SET_SECTIONS': {
      const newSections = [...action.payload];
      const updatedHistory = [...state.history].slice(0, state.historyIndex + 1);
      updatedHistory.push(newSections);
      return {
        sections: newSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    case 'UPDATE_SECTION': {
      const { sectionId, updates } = action;
      const updatedSections = state.sections.map((section) =>
        section.id === sectionId
          ? { 
              ...section, 
              // Merge updates, handling isVisible specially
              ...(updates.hasOwnProperty('isVisible') 
                ? { 
                    settings: {
                      ...section.settings,
                      isVisible: updates.isVisible
                    }
                  }
                : {}),
              settings: { 
                ...section.settings, 
                ...updates 
              }
            }
          : section
      );

      const updatedHistory = state.history.slice(0, state.historyIndex + 1);
      updatedHistory.push(updatedSections);

      return {
        sections: updatedSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    case 'ADD_SECTION': {
      const { payload, index } = action;
      let updatedSections: Section[];
      if (index !== undefined && index !== null) {
        updatedSections = [...state.sections];
        updatedSections.splice(index, 0, payload);
      } else {
        updatedSections = [...state.sections, payload];
      }

      const updatedHistory = state.history.slice(0, state.historyIndex + 1);
      updatedHistory.push(updatedSections);

      return {
        sections: updatedSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    case 'DELETE_SECTION': {
      const updatedSections = state.sections.filter(
        (section) => section.id !== action.sectionId
      );

      const updatedHistory = state.history.slice(0, state.historyIndex + 1);
      updatedHistory.push(updatedSections);

      return {
        sections: updatedSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    case 'MOVE_SECTION': {
      const { sectionId, direction } = action;
      const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
      
      if (sectionIndex === -1) return state;
      
      const newSections = [...state.sections];
      
      if (direction === 'up' && sectionIndex > 0) {
        // Swap with the section above
        [newSections[sectionIndex], newSections[sectionIndex - 1]] = 
        [newSections[sectionIndex - 1], newSections[sectionIndex]];
      } else if (direction === 'down' && sectionIndex < newSections.length - 1) {
        // Swap with the section below
        [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
        [newSections[sectionIndex + 1], newSections[sectionIndex]];
      } else {
        return state; // No change if at the top/bottom
      }

      const updatedHistory = state.history.slice(0, state.historyIndex + 1);
      updatedHistory.push(newSections);

      return {
        sections: newSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          sections: state.history[newIndex],
          history: state.history,
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          sections: state.history[newIndex],
          history: state.history,
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case 'REORDER_SECTIONS': {
      const { sectionId, blocks } = action;
      const updatedSections = state.sections.map((section) =>
        section.id === sectionId
          ? { ...section, content: blocks }
          : section
      );

      const updatedHistory = state.history.slice(0, state.historyIndex + 1);
      updatedHistory.push(updatedSections);

      return {
        sections: updatedSections,
        history: updatedHistory,
        historyIndex: updatedHistory.length - 1,
      };
    }

    default:
      return state;
  }
}
