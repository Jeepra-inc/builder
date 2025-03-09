"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { SortableItem } from "./SortableItem";
import { sectionRegistry } from "@/app/builder/elements/sections/section-registry";
import {
  SortableLayersPanelProps,
  IframeMessage,
  Section,
  SectionType,
} from "@/app/builder/types";
import { AddSectionModal } from "@/app/builder/components/common/AddSectionModal";

const sendIframeMessage = (
  contentRef: React.RefObject<HTMLIFrameElement | null>,
  message: IframeMessage
) => {
  contentRef.current?.contentWindow?.postMessage(message, "*");
};

export function SortableLayersPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onHoverSection,
  setSections,
  contentRef,
}: SortableLayersPanelProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bottomAddSectionOpen, setBottomAddSectionOpen] = useState(false);
  const [separatorAddSectionIndex, setSeparatorAddSectionIndex] = useState<
    number | null
  >(null);

  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  const availableSections = sectionRegistry.getAllSections();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance before drag starts (px)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const insertSection = (sectionType: SectionType, index: number) => {
    // Create a new section with the correct type
    const newSection: Section = {
      id: nanoid(),
      type: sectionType,
      content: {},
      settings: {},
    };

    setSections((prev) => {
      const newSections = [...prev];
      newSections.splice(index, 0, newSection);
      return newSections;
    });

    // Send message to iframe to add the section
    sendIframeMessage(contentRef, {
      type: "ADD_SECTION",
      section: newSection,
      index,
      scrollToSection: true,
    });

    // Select the new section
    onSelectSection(String(newSection.id));
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    sendIframeMessage(contentRef, { type: "DELETE_SECTION", sectionId });
  };

  const toggleVisibility = (section: Section) => {
    const newVisibility = !(section.isVisible ?? true);

    setSections((prev) => {
      const updated = prev.map((s) =>
        s.id === section.id ? { ...s, isVisible: newVisibility } : s
      );
      return updated;
    });

    sendIframeMessage(contentRef, {
      type: "TOGGLE_SECTION_VISIBILITY",
      sectionId: section.id,
      isVisible: newVisibility,
    });
  };

  const handleAddSection = (sectionType: SectionType, index?: number) => {
    const insertIndex = index !== undefined ? index : sections.length;
    insertSection(sectionType, insertIndex);
    setSeparatorAddSectionIndex(null);
    setBottomAddSectionOpen(false);
  };

  const handleDuplicateSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const duplicated = { ...section, id: nanoid() };
    const index = sections.findIndex((s) => s.id === sectionId);

    setSections((prev) => {
      const newSections = [...prev];
      newSections.splice(index + 1, 0, duplicated);
      return newSections;
    });

    sendIframeMessage(contentRef, {
      type: "ADD_SECTION",
      section: duplicated,
      index: index + 1,
      scrollToSection: true,
    });

    onSelectSection(String(duplicated.id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverTriggerRef.current &&
        !popoverTriggerRef.current.contains(event.target as Node) &&
        popoverContentRef.current &&
        !popoverContentRef.current.contains(event.target as Node)
      ) {
        setLocalOpen(false);
        setActiveIndex(null);
        setHoverIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add event listener for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Make sure we only process messages from our iframe
      if (contentRef.current?.contentWindow !== event.source) return;

      const message = event.data;

      // Handle various section messages from iframe
      if (message.type === "SECTION_REORDERED") {
        if (message.sections && Array.isArray(message.sections)) {
          setSections(message.sections);
        }
      } else if (message.type === "UPDATE_SECTIONS") {
        if (message.sections && Array.isArray(message.sections)) {
          setSections(message.sections);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [contentRef]);

  const sendMessageToIframe = (
    type: string,
    payload: Partial<IframeMessage>
  ) => {
    sendIframeMessage(contentRef, { type, ...payload });
  };

  const setActiveSection = (
    id: UniqueIdentifier | null,
    index: number | null
  ) => {
    setActiveId(id);
    setActiveIndex(index);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const index = sections.findIndex((s) => s.id === active.id);
    setActiveSection(active.id, index);
    setIsDragging(true);

    sendMessageToIframe("DRAG_START", {
      sectionId: String(active.id),
      source: "layer_panel",
      index,
      sections: sections.map((s) => ({ ...s, id: s.id })),
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updated = arrayMove(sections, oldIndex, newIndex);
        setSections(updated);

        sendMessageToIframe("SECTIONS_UPDATED", {
          sections: updated,
          moveInfo: {
            sectionId: String(active.id),
            oldIndex,
            newIndex,
          },
        });
      }
    }

    setActiveSection(null, null);
    setIsDragging(false);

    sendMessageToIframe("DRAG_END", {
      source: "layer_panel",
    });
  };

  const renderSectionSeparator = (index: number) => (
    <div
      key={`separator-${index}`}
      ref={separatorRef}
      className="relative group h-[4px] z-50 transition-colors duration-200 flex items-center justify-center"
      onMouseEnter={() =>
        requestAnimationFrame(() => {
          activeIndex === null && setHoverIndex(index);
        })
      }
      onMouseLeave={(e) => {
        const target = e.relatedTarget as Node;
        activeIndex === null &&
          !popoverTriggerRef.current?.contains(target) &&
          !e.currentTarget.contains(target) &&
          setHoverIndex(null);
      }}
    >
      <div className="absolute w-full h-full overflow-hidden">
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 h-[4px] rounded-full overflow-hidden bg-indigo-600 
            transition-all duration-300 ease-out delay-50
            ${
              [separatorAddSectionIndex, hoverIndex].includes(index)
                ? "w-full"
                : "w-0"
            }`}
        />
      </div>

      {(hoverIndex === index || separatorAddSectionIndex === index) && (
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-[10000]">
          <AddSectionModal
            open={separatorAddSectionIndex === index}
            onOpenChange={(open) => {
              setSeparatorAddSectionIndex(open ? index : null);
            }}
            onAddSection={(type) => {
              handleAddSection(type, index);
            }}
            buttonVariant="outline"
            buttonSize="icon"
            buttonClassName={`bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center 
              cursor-pointer hover:bg-indigo-600 transition-all duration-200 ease-in-out 
              scale-75 group-hover:scale-100
              ${separatorAddSectionIndex === index ? "scale-100" : ""}`}
          />
        </div>
      )}
    </div>
  );

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-1 px-3 py-1">
          {sections.length === 0 ? (
            <div className="my-2">
              <AddSectionModal
                onAddSection={(type) => handleAddSection(type)}
                buttonVariant="outline"
                buttonSize="default"
                buttonClassName="w-full"
                showButtonText={true}
              />
            </div>
          ) : (
            <div>
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, index) => {
                  return (
                    <div key={section.id}>
                      {renderSectionSeparator(index)}
                      <SortableItem
                        section={section}
                        index={index}
                        isDragging={activeId === section.id}
                        selectedSectionId={selectedSectionId}
                        onSelectSection={onSelectSection}
                        onDelete={() => deleteSection(section.id)}
                        onDuplicate={() => handleDuplicateSection(section.id)}
                        onToggleVisibility={() => toggleVisibility(section)}
                        onHover={onHoverSection}
                      />
                    </div>
                  );
                })}
                {renderSectionSeparator(sections.length)}
              </SortableContext>
            </div>
          )}

          {sections.length > 0 && (
            <AddSectionModal
              onAddSection={(type) => handleAddSection(type)}
              buttonVariant="outline"
              buttonSize="default"
              buttonClassName="w-full"
              showButtonText={true}
            />
          )}
        </div>

        <DragOverlay>
          {activeId && activeIndex !== null && (
            <div className="shadow-lg rounded-lg bg-zinc-200 w-full">
              <SortableItem
                section={sections[activeIndex]}
                index={activeIndex}
                isDragging={true}
                selectedSectionId={selectedSectionId}
                onSelectSection={onSelectSection}
                onDelete={() => {}}
                onDuplicate={() => {}}
                onToggleVisibility={() => {}}
                onHover={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
