// src/utils/sectionUtils.ts

import { SectionSchema } from '@/app/builder/types';

/**
 * Merges user-provided settings with schema defaults.
 * @param schema - The SectionSchema defining fields and settings.
 * @param userSettings - User-provided settings for the section.
 * @returns A consolidated object containing resolved settings.
 */
export function getResolvedSettings(
  schema: SectionSchema,
  userSettings: Record<string, any> = {}
): Record<string, any> {
  // Combine all fields from 'schema' and 'settings'
  const combinedFields = [
    ...(Array.isArray(schema.schema) ? schema.schema : []),
    ...(Array.isArray(schema.settings) ? schema.settings : [])
  ];

  // Reduce combined fields to a single settings object with defaults applied
  return combinedFields.reduce((acc, field) => {
    if (field.id) {
      acc[field.id] = userSettings[field.id] ?? field.default;
    }
    return acc;
  }, {} as Record<string, any>);
}
