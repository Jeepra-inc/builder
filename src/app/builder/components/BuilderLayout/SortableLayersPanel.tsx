"use client";

import React, { useState, useRef, useEffect, Fragment } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { SortableItem } from "./SortableItem";
import { sectionRegistry } from "@/app/builder/elements/sections/section-registry";
import { 
  SortableLayersPanelProps, 
  AddSectionButtonsProps, 
  AddSectionPopoverProps,
  IframeMessage,
  Section
} from '@/app/builder/types';

// Utility functions
const createSection = (sectionType: any): Section => ({
  id: nanoid(),
  type: sectionType.type,
  content: sectionType.defaultContent || {},
  settings: {}
});

const sendIframeMessage = (contentRef: React.RefObject<HTMLIFrameElement | null>, message: IframeMessage) => {
  contentRef.current?.contentWindow?.postMessage(message, "*");
};

// Reusable Components
const AddSectionButtons = ({ availableSections, onAddSection }: AddSectionButtonsProps) => (
  <div className="grid grid-cols-3 gap-2">
    {availableSections.map((sectionType) => {
      const SectionIcon = sectionType.placeholderImage
        ? () => (
            <img
              src={sectionType.placeholderImage}
              alt={sectionType.name}
              className="h-6 w-6"
            />
          )
        : Plus;

      return (
        <Button
          key={sectionType.type}
          variant="ghost"
          className="flex flex-col items-center justify-center h-20 hover:bg-blue-50 space-y-2 p-2"
          onClick={() => onAddSection(sectionType)}
        >
          <SectionIcon className="h-6 w-6 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 capitalize">
            {sectionType.name}
          </span>
        </Button>
      );
    })}
  </div>
);

const AddSectionPopover = ({
  open,
  onOpenChange,
  popoverTriggerRef,
  popoverContentRef,
  children,
  availableSections,
  onAddSection,
  side = "right",
  align = "center",
  modal = true
}: AddSectionPopoverProps) => (
  <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent
      ref={popoverContentRef}
      side={side}
      align={align}
      className="w-72 p-2"
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      onEscapeKeyDown={() => onOpenChange(false)}
      onPointerDownOutside={() => onOpenChange(false)}
    >
      <AddSectionButtons
        availableSections={availableSections}
        onAddSection={onAddSection}
      />
    </PopoverContent>
  </Popover>
);

export function SortableLayersPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onHoverSection,
  setSections,
  contentRef
}: SortableLayersPanelProps) {
  // States
  const [localOpen, setLocalOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [bottomAddSectionOpen, setBottomAddSectionOpen] = useState(false);
  const [separatorAddSectionIndex, setSeparatorAddSectionIndex] = useState<number | null>(null);

  // Refs
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

  // Available sections
  const availableSections = sectionRegistry.getAllSections();

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Section Management Functions
  const addSectionToIframe = (newSection: Section, index?: number) => {
    sendIframeMessage(contentRef, {
      type: "ADD_SECTION",
      section: newSection,
      index,
      scrollToSection: true
    });
  };

  const deleteSectionFromIframe = (sectionId: string) => {
    sendIframeMessage(contentRef, {
      type: "DELETE_SECTION",
      sectionId
    });
  };

  const toggleSectionVisibility = (section: Section) => {
    const newVisibility = section.isVisible === undefined ? false : !section.isVisible;

    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === section.id ? { ...s, isVisible: newVisibility } : s
      )
    );

    sendIframeMessage(contentRef, {
      type: "TOGGLE_SECTION_VISIBILITY",
      sectionId: section.id,
      isVisible: newVisibility
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    const sectionToDuplicate = sections.find((s) => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const duplicatedSection = { ...sectionToDuplicate, id: nanoid() };
    const index = sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections.splice(index + 1, 0, duplicatedSection);
      return newSections;
    });

    addSectionToIframe(duplicatedSection, index + 1);
    onSelectSection(duplicatedSection.id);
  };

  // Event Handlers
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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeIdAsString = String(active.id);
    const index = sections.findIndex((section) => section.id === activeIdAsString);
    setActiveId(activeIdAsString);
    setActiveIndex(index);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedSections = [...sections];
        const [movedSection] = updatedSections.splice(oldIndex, 1);
        updatedSections.splice(newIndex, 0, movedSection);
        setSections(updatedSections);

        sendIframeMessage(contentRef, {
          type: 'REORDER_SECTIONS',
          sections: updatedSections
        });
      }
    }
    setActiveId(null);
    setActiveIndex(null);
  };

  // Render Helpers
  const renderSectionSeparator = (index: number) => (
    <div
      key={`separator-${index}`}
      ref={separatorRef}
      className="relative group h-[4px] z-50 transition-colors duration-200 flex items-center justify-center"
      onMouseEnter={() => {
        requestAnimationFrame(() => {
          if (activeIndex === null) {
            setHoverIndex(index);
          }
        });
      }}
      onMouseLeave={(e) => {
        const relatedTarget = e.relatedTarget as Node;
        if (
          activeIndex === null &&
          !popoverTriggerRef.current?.contains(relatedTarget) &&
          !e.currentTarget.contains(relatedTarget)
        ) {
          setHoverIndex(null);
        }
      }}
    >
      <div className="absolute w-full h-full overflow-hidden">
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 h-[3px] bg-blue-600 
            transition-all duration-300 ease-out delay-50
            ${
              separatorAddSectionIndex === index || hoverIndex === index
                ? "w-full"
                : "w-0"
            }
          `}
        />
      </div>

      {(hoverIndex === index || separatorAddSectionIndex === index) && (
        <AddSectionPopover
          open={separatorAddSectionIndex === index}
          onOpenChange={(open) => {
            if (open) {
              setSeparatorAddSectionIndex(index);
              setBottomAddSectionOpen(false);
            } else {
              setSeparatorAddSectionIndex(null);
            }
          }}
          popoverTriggerRef={popoverTriggerRef}
          popoverContentRef={popoverContentRef}
          availableSections={availableSections}
          side="right"
          align="center"
          onAddSection={(sectionType) => {
            const newSection = createSection(sectionType);
            const newSections = [...sections];
            newSections.splice(index, 0, newSection);
            setSections(newSections);
            addSectionToIframe(newSection, index);
            onSelectSection(newSection.id);
            setSeparatorAddSectionIndex(null);
          }}
        >
          <button
            ref={popoverTriggerRef}
            type="button"
            className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 
              bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center 
              cursor-pointer hover:bg-blue-600 transition-all duration-200 ease-in-out 
              scale-75 group-hover:scale-100
              ${separatorAddSectionIndex === index ? "scale-100" : ""}
            `}
          >
            <Plus className="w-4 h-4" />
          </button>
        </AddSectionPopover>
      )}
    </div>
  );

  const renderAddSectionButton = (isBottom = true) => (
    <AddSectionPopover
      open={bottomAddSectionOpen}
      onOpenChange={(open) => {
        setBottomAddSectionOpen(open);
        setSeparatorAddSectionIndex(null);
      }}
      popoverTriggerRef={popoverTriggerRef}
      popoverContentRef={popoverContentRef}
      availableSections={availableSections}
      side="right"
      align="start"
      onAddSection={(sectionType) => {
        const newSection = createSection(sectionType);
        addSectionToIframe(newSection);
        setSections((prevSections) => [...prevSections, newSection]);
        onSelectSection(newSection.id);
        setBottomAddSectionOpen(false);
      }}
    >
      <Button
        ref={popoverTriggerRef}
        variant="outline"
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Section
      </Button>
    </AddSectionPopover>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {sections.length === 0 ? (
        <div className="my-2">
          {renderAddSectionButton(false)}
        </div>
      ) : (
        <>
          <SortableContext
            items={sections.map((section) => section.id)}
            strategy={rectSortingStrategy}
          >
            <div>
              {sections.map((section, index) => (
                <Fragment key={section.id}>
                  {renderSectionSeparator(index)}
                  <SortableItem
                    section={section}
                    index={index}
                    isDragging={false}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={onSelectSection}
                    onDelete={() => {
                      deleteSectionFromIframe(section.id);
                      setSections((prevSections) =>
                        prevSections.filter((s) => s.id !== section.id)
                      );
                    }}
                    onDuplicate={() => handleDuplicateSection(section.id)}
                    onToggleVisibility={() => toggleSectionVisibility(section)}
                    onHover={onHoverSection}
                  />
                </Fragment>
              ))}
              {renderSectionSeparator(sections.length)}
            </div>
          </SortableContext>

          <div className="p-2">
            {renderAddSectionButton(true)}
          </div>
        </>
      )}

      <DragOverlay>
        {activeId && (
          <div className="shadow-lg rounded-lg bg-zinc-200">
            <SortableItem
              section={sections[activeIndex!]}
              index={activeIndex!}
              isDragging={true}
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
              onDelete={() => {
                deleteSectionFromIframe(sections[activeIndex!].id);
                setSections((prevSections) =>
                  prevSections.filter((s) => s.id !== sections[activeIndex!].id)
                );
              }}
              onDuplicate={() => handleDuplicateSection(sections[activeIndex!].id)}
              onToggleVisibility={() => toggleSectionVisibility(sections[activeIndex!])}
              onHover={onHoverSection}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
