// src/hooks/useResolvedSettings.ts

import { useMemo } from 'react';
import { SectionSchema } from '@/app/builder/types';
import { getResolvedSettings } from '../utils/sectionUtils';

/**
 * Custom hook to resolve section settings based on schema and user-provided settings.
 * @param schema - The SectionSchema defining fields and settings.
 * @param userSettings - User-provided settings for the section.
 * @returns A consolidated object containing resolved settings.
 */
export function useResolvedSettings(
  schema: SectionSchema,
  userSettings: Record<string, any> = {}
): Record<string, any> {
  return useMemo(() => getResolvedSettings(schema, userSettings), [schema, userSettings]);
}
