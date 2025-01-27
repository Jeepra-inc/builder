"use client";
import { useEffect, useState } from 'react';
import { Section } from '@/app/builder/types';

interface UseUndoRedoProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

export function useUndoRedo({ sections, setSections }: UseUndoRedoProps) {
  const [history, setHistory] = useState<Section[][]>([[]]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  useEffect(() => {
    // If we're at the end of the history, push new state
    if (currentHistoryIndex === history.length - 1) {
      setHistory(prev => [...prev, sections]);
      setCurrentHistoryIndex(prev => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setSections(history[newIndex]);
      setCurrentHistoryIndex(newIndex);
      window.parent.postMessage(
        {
          type: 'SECTIONS_UPDATED',
          sections: history[newIndex],
        },
        '*'
      );
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setSections(history[newIndex]);
      setCurrentHistoryIndex(newIndex);
      window.parent.postMessage(
        {
          type: 'SECTIONS_UPDATED',
          sections: history[newIndex],
        },
        '*'
      );
    }
  };

  return {
    handleUndo,
    handleRedo,
  };
}
