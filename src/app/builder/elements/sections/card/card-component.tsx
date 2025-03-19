import React, { FC } from "react";
import clsx from "clsx";
import { SectionSchema, SectionType } from "@/app/builder/types";
import withSection from "../withSection";

interface CardComponentType extends FC<any> {
  schema?: SectionSchema;
}

// Create the card schema
export const cardSchema: SectionSchema = {
  name: "Card",
  type: SectionType.Card,
  schema: [
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "Card Title",
    },
    {
      id: "content",
      type: "textarea",
      label: "Content",
      default: "Card content goes here",
    },
  ],
  settings: [
    {
      id: "padding",
      type: "select",
      label: "Padding",
      options: [
        { value: "0", label: "None" },
        { value: "2", label: "Small" },
        { value: "4", label: "Medium" },
        { value: "6", label: "Large" },
      ],
      default: "4",
    },
    {
      id: "border",
      type: "checkbox",
      label: "Show Border",
      default: true,
    },
    {
      id: "shadow",
      type: "select",
      label: "Shadow",
      options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      default: "sm",
    },
    {
      id: "rounded",
      type: "select",
      label: "Rounded Corners",
      options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      default: "md",
    },
  ],
};

// Create the Card component
const CardComponent: CardComponentType = withSection({
  schema: cardSchema,
  renderContent: (settings) => {
    return (
      <div
        className={clsx("mx-auto", {
          [`p-${settings.padding || "4"}`]: settings.padding,
          border: settings.border,
          [`shadow-${settings.shadow}`]:
            settings.shadow && settings.shadow !== "none",
          [`rounded-${settings.rounded}`]:
            settings.rounded && settings.rounded !== "none",
        })}
      >
        {settings.title && (
          <h3 className="text-xl font-semibold mb-2">{settings.title}</h3>
        )}
        {settings.content && (
          <div className="prose max-w-none">{settings.content}</div>
        )}
      </div>
    );
  },
});

CardComponent.schema = cardSchema;
export { CardComponent };
