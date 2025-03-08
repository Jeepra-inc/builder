"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  Type,
  Image,
  Settings,
  Layers,
  LayoutPanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  SlidersHorizontal,
  AppWindow,
  AlignVerticalSpaceBetween,
  Search,
  FileText,
  Eye,
  Calendar,
  CheckSquare,
  Plus,
  Video,
  User,
} from "lucide-react";
import { SectionSettingsPanel } from "@/app/builder/components/BuilderLayout/SectionSettingsPanel";
import { GlobalSettingsPanel } from "@/app/builder/components/BuilderLayout/GlobalSettings/GlobalSettingsPanel";
import { SortableLayersPanel } from "@/app/builder/components/BuilderLayout/SortableLayersPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MultiLevelSidebar from "../common/multiLevelSidebar";
import { HeaderLayoutsPanel } from "./header/settings/HeaderLayoutsPanel";
import { TopBarSettingsPanel } from "./header/settings/TopBarSettingsPanel";
import { HeaderMainSettings } from "./header/settings/HeaderMainSettings";
import { HeaderBottomSettings } from "./header/settings/HeaderBottomSettings";
import { HeaderNavigationSettings } from "./header/settings/HeaderNavigationSettings";
import { HeaderSearchSettings } from "./header/settings/HeaderSearchSettings";
import { HeaderButtonSettings } from "./header/settings/HeaderButtonSettings";
import { HeaderSocialSettings } from "./header/settings/HeaderSocialSettings";
import { HeaderHtmlSettings } from "./header/settings/HeaderHtmlSettings";
import { HeaderAccountSettings } from "./header/settings/HeaderAccountSettings";
import { FooterSettingsPanel } from "./footer/FooterSettingsPanel";
import { SidebarLeftProps } from "@/app/builder/types";
import { HeaderSettingsPanel } from "./header/HeaderSettingsPanel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/image-uploader";

const SECTION_SETTINGS_TAB = "Section Settings";

function SEOSettingsPanel() {
  return (
    <div className="h-full w-full">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-800">
          SEO Settings
        </h2>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="p-4 pb-8">
          <Accordion type="single" collapsible className="w-full">
            {/* General SEO Settings */}
            <AccordionItem value="general">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>General</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="focus_keyword"
                      className="mb-2 block text-sm font-medium"
                    >
                      Focus Keyword
                    </Label>
                    <Input
                      id="focus_keyword"
                      placeholder="Enter main keyword or phrase"
                      className="max-w-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The main keyword or phrase you want this page to rank for
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="meta_title"
                      className="mb-2 block text-sm font-medium"
                    >
                      Meta Title
                    </Label>
                    <Input
                      id="meta_title"
                      placeholder="Enter page title"
                      className="max-w-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 50-60 characters
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="meta_description"
                      className="mb-2 block text-sm font-medium"
                    >
                      Meta Description
                    </Label>
                    <textarea
                      id="meta_description"
                      placeholder="Enter page description"
                      className="w-full max-w-md rounded-md border border-gray-300 p-2 text-sm"
                      rows={3}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 120-155 characters
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Media Settings */}
            <AccordionItem value="social">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Social Media</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                <div className="space-y-4">
                  <div className="mb-4">
                    <Label className="mb-2 block text-sm font-medium">
                      Facebook & Open Graph
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label
                          htmlFor="og_title"
                          className="mb-1 block text-sm"
                        >
                          OG Title
                        </Label>
                        <Input
                          id="og_title"
                          placeholder="Enter Open Graph title"
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="og_description"
                          className="mb-1 block text-sm"
                        >
                          OG Description
                        </Label>
                        <textarea
                          id="og_description"
                          placeholder="Enter Open Graph description"
                          className="w-full max-w-md rounded-md border border-gray-300 p-2 text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="og_image"
                          className="mb-1 block text-sm"
                        >
                          OG Image
                        </Label>
                        <ImageUploader
                          onChange={(image: string | File) =>
                            console.log(image)
                          }
                          className="max-w-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-medium">
                      Twitter Card
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label
                          htmlFor="twitter_title"
                          className="mb-1 block text-sm"
                        >
                          Twitter Title
                        </Label>
                        <Input
                          id="twitter_title"
                          placeholder="Enter Twitter title"
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="twitter_description"
                          className="mb-1 block text-sm"
                        >
                          Twitter Description
                        </Label>
                        <textarea
                          id="twitter_description"
                          placeholder="Enter Twitter description"
                          className="w-full max-w-md rounded-md border border-gray-300 p-2 text-sm"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="twitter_image"
                          className="mb-1 block text-sm"
                        >
                          Twitter Image
                        </Label>
                        <ImageUploader
                          onChange={(image: string | File) =>
                            console.log(image)
                          }
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="twitter_card_type"
                          className="mb-1 block text-sm"
                        >
                          Card Type
                        </Label>
                        <select
                          id="twitter_card_type"
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-full max-w-md"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">
                            Summary with Large Image
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Advanced Settings */}
            <AccordionItem value="advanced">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Advanced</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="canonical_url"
                      className="mb-2 block text-sm font-medium"
                    >
                      Canonical URL
                    </Label>
                    <Input
                      id="canonical_url"
                      placeholder="https://example.com/canonical-page"
                      className="max-w-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Set this if this page is a duplicate of another page
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="mb-2 block text-sm font-medium">
                      Robots Meta
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="noindex" />
                        <Label htmlFor="noindex" className="text-sm">
                          No Index (prevent page from being indexed)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="nofollow" />
                        <Label htmlFor="nofollow" className="text-sm">
                          No Follow (don't follow links on this page)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="schema_type"
                      className="mb-2 block text-sm font-medium"
                    >
                      Schema Type
                    </Label>
                    <select
                      id="schema_type"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-full max-w-md"
                    >
                      <option value="WebPage">WebPage (default)</option>
                      <option value="Article">Article</option>
                      <option value="BlogPosting">Blog Post</option>
                      <option value="Product">Product</option>
                      <option value="FAQPage">FAQ Page</option>
                      <option value="HowTo">How-To</option>
                      <option value="LocalBusiness">Local Business</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sitemap Settings */}
            <AccordionItem value="sitemap">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Sitemap</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="include_in_sitemap"
                      className="text-sm font-medium"
                    >
                      Include in Sitemap
                    </Label>
                    <Switch id="include_in_sitemap" checked={true} />
                  </div>

                  <div>
                    <Label
                      htmlFor="sitemap_priority"
                      className="mb-2 block text-sm font-medium"
                    >
                      Priority (0.0 - 1.0)
                    </Label>
                    <select
                      id="sitemap_priority"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-full max-w-md"
                    >
                      <option value="0.1">0.1 (Very Low)</option>
                      <option value="0.3">0.3 (Low)</option>
                      <option value="0.5">0.5 (Medium)</option>
                      <option value="0.7">0.7 (High)</option>
                      <option value="1.0">1.0 (Very High)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Relative importance of this page compared to other pages
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="sitemap_changefreq"
                      className="mb-2 block text-sm font-medium"
                    >
                      Change Frequency
                    </Label>
                    <select
                      id="sitemap_changefreq"
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm w-full max-w-md"
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Breadcrumbs Settings */}
            <AccordionItem value="breadcrumbs">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Breadcrumbs</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="enable_breadcrumbs"
                      className="text-sm font-medium"
                    >
                      Enable Breadcrumbs
                    </Label>
                    <Switch id="enable_breadcrumbs" checked={true} />
                  </div>

                  <div>
                    <Label
                      htmlFor="breadcrumb_title"
                      className="mb-2 block text-sm font-medium"
                    >
                      Breadcrumb Title
                    </Label>
                    <Input
                      id="breadcrumb_title"
                      placeholder="Enter breadcrumb title"
                      className="max-w-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The title to use in breadcrumb trails (can differ from
                      page title)
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="breadcrumb_parent"
                      className="mb-2 block text-sm font-medium"
                    >
                      Parent Page
                    </Label>
                    <Input
                      id="breadcrumb_parent"
                      placeholder="Select parent page"
                      className="max-w-md"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

function PageSettingsPanel() {
  return (
    <div className="h-full w-full">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-800">
          Page Settings
        </h2>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-6 pb-8">
          {/* Publish Status Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Publish</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-center pb-3">
                <Button variant="outline" className="w-full max-w-xs">
                  Preview Changes
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">Status: </span>
                  <span className="text-sm font-semibold">Published</span>
                  <Button
                    variant="link"
                    className="text-xs p-0 h-auto ml-2 text-blue-600"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500">
                  <Eye className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">Visibility: </span>
                  <span className="text-sm font-semibold">Public</span>
                  <Button
                    variant="link"
                    className="text-xs p-0 h-auto ml-2 text-blue-600"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">Published on: </span>
                  <span className="text-sm font-semibold">
                    May 31, 2022 at 14:27
                  </span>
                  <Button
                    variant="link"
                    className="text-xs p-0 h-auto ml-2 text-blue-600"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">SEO: </span>
                  <span className="text-sm font-semibold">Not available</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-gray-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">Readability: </span>
                  <span className="text-sm font-semibold">
                    Needs improvement
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                <Button
                  variant="link"
                  className="text-sm p-0 h-auto text-red-600"
                >
                  Move to Trash
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Update
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Categories
              </h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex border-b border-gray-200 pb-2 mb-3">
                <Button
                  variant="ghost"
                  className="text-sm px-2 py-1 h-auto rounded-md"
                >
                  All Categories
                </Button>
                <Button
                  variant="link"
                  className="text-sm text-blue-600 px-2 py-1 h-auto"
                >
                  Most Used
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-article" checked />
                    <Label htmlFor="cat-article" className="text-sm">
                      Article
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="text-sm text-blue-600 p-0 h-auto"
                  >
                    Make primary
                  </Button>
                </div>

                <div className="flex items-center justify-between ml-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-general" checked />
                    <Label htmlFor="cat-general" className="text-sm">
                      General
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="text-sm text-blue-600 p-0 h-auto"
                  >
                    Make primary
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-conseils" checked />
                    <Label htmlFor="cat-conseils" className="text-sm">
                      Conseils d'Experts
                    </Label>
                  </div>
                  <span className="text-sm font-semibold">Primary</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-acoustic" />
                    <Label htmlFor="cat-acoustic" className="text-sm">
                      Acoustic Science
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-basic" />
                    <Label htmlFor="cat-basic" className="text-sm">
                      Basic Knowledge
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-news" />
                    <Label htmlFor="cat-news" className="text-sm">
                      News
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between ml-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-press" />
                    <Label htmlFor="cat-press" className="text-sm">
                      Press
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cat-product" />
                    <Label htmlFor="cat-product" className="text-sm">
                      Product Category
                    </Label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="link"
                  className="text-sm text-blue-600 p-0 h-auto flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add New Category
                </Button>
              </div>
            </div>
          </div>

          {/* Format Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Format</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="format-standard"
                  name="format"
                  checked
                />
                <div className="text-gray-500">
                  <FileText className="h-5 w-5" />
                </div>
                <Label htmlFor="format-standard" className="text-sm">
                  Standard
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <input type="radio" id="format-video" name="format" />
                <div className="text-gray-500">
                  <Video className="h-5 w-5" />
                </div>
                <Label htmlFor="format-video" className="text-sm">
                  Video
                </Label>
              </div>
            </div>
          </div>

          {/* Tags Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Tags</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input placeholder="Add tags..." className="flex-1" />
                <Button variant="outline">Add</Button>
              </div>

              <p className="text-sm text-gray-500">Separate tags with commas</p>

              <Button
                variant="link"
                className="text-sm text-blue-600 p-0 h-auto"
              >
                Choose from the most used tags
              </Button>
            </div>
          </div>

          {/* Featured Image Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Featured image
              </h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <img
                  src="/placeholder-featured-image.jpg"
                  alt="Featured image preview"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "200px" }}
                />
              </div>

              <p className="text-sm text-gray-500">
                Click the image to edit or update
              </p>

              <Button
                variant="link"
                className="text-sm text-red-600 p-0 h-auto"
              >
                Remove featured image
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Create icon components with increased stroke width
const DesignIcon = (
  props: React.ComponentProps<typeof AlignVerticalSpaceBetween>
) => <AlignVerticalSpaceBetween strokeWidth={2} {...props} />;

const HeaderIcon = (props: React.ComponentProps<typeof PanelTop>) => (
  <PanelTop strokeWidth={2} {...props} />
);

const FooterIcon = (props: React.ComponentProps<typeof PanelBottom>) => (
  <PanelBottom strokeWidth={2} {...props} />
);

const GlobalSettingsIcon = (props: { className?: string }) => (
  <SlidersHorizontal {...props} strokeWidth={2.5} />
);

const SEOIcon = (props: { className?: string }) => (
  <Search {...props} strokeWidth={2.5} />
);

const PageSettingIcon = (props: { className?: string }) => (
  <FileText {...props} strokeWidth={2.5} />
);

export function SidebarLeft({
  sections,
  selectedSectionId,
  onSelectSection,
  onHoverSection,
  contentRef,
  toggleNarrowSidebar,
  settingsPanelRef,
  activeSubmenu,
  headerSettings,
}: SidebarLeftProps) {
  const [localSections, setLocalSections] = useState(sections);
  const [currentSubmenu, setCurrentSubmenu] = useState<string | null>(
    activeSubmenu || null
  );
  const [selectedHeaderSetting, setSelectedHeaderSetting] = useState<
    string | null
  >(null);

  // Initialize currentPreset from headerSettings if available, otherwise default to preset1
  const [currentPreset, setCurrentPreset] = useState<string>(
    headerSettings?.layout?.currentPreset || "preset1"
  );

  // Update currentPreset when headerSettings changes
  useEffect(() => {
    if (headerSettings?.layout?.currentPreset) {
      setCurrentPreset(headerSettings.layout.currentPreset);
    }
  }, [headerSettings]);

  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const { targetTab, targetSubmenu, settingId, directNav } = event.detail;
      console.log("Switch tab event received:", {
        targetTab,
        targetSubmenu,
        settingId,
        directNav,
      });

      // Check if we're already on the correct header settings with the same submenu
      const alreadyOnCorrectPage =
        activeSubmenu === targetSubmenu && selectedHeaderSetting === settingId;

      if (alreadyOnCorrectPage) {
        console.log("Already on the correct header submenu, skipping update");
        return; // Exit early, no changes needed
      }

      if (targetTab === "Header") {
        // If directNav flag is true, we'll handle this with one operation to prevent flickering
        if (directNav) {
          // First update our state so it's ready for when the sidebar opens
          if (targetSubmenu && currentSubmenu !== targetSubmenu) {
            setCurrentSubmenu(targetSubmenu);
          }

          // Update the selected setting if needed
          if (settingId && selectedHeaderSetting !== settingId) {
            setSelectedHeaderSetting(settingId);
          }

          // Then trigger sidebar toggle - which will now show the correct content immediately
          toggleNarrowSidebar("header-settings");
        } else {
          // Traditional navigation (for backward compatibility)
          setCurrentSubmenu(targetSubmenu);
          toggleNarrowSidebar("header-settings");
        }
      } else if (targetTab === "Design") {
        setCurrentSubmenu(null);
      } else if (targetTab === "Section Settings") {
        toggleNarrowSidebar("settings");
      }
    };

    const handleHeaderSettingSelected = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      switch (event.data.type) {
        case "CHECK_ACTIVE_SETTING":
          // This is a new message type to check if a setting is already active
          const isSettingActive =
            // Check if sidebar is open with header settings
            activeSubmenu === event.data.submenu &&
            // Check if the specific setting is selected
            selectedHeaderSetting === event.data.settingId;

          // Log for debugging
          console.log("Checking if setting is active:", {
            requestedSetting: event.data.settingId,
            requestedSubmenu: event.data.submenu,
            currentSubmenu: activeSubmenu,
            currentSetting: selectedHeaderSetting,
            isActive: isSettingActive,
          });

          // Send response back to iframe
          contentRef.current?.contentWindow?.postMessage(
            {
              type: "SETTING_STATE_RESPONSE",
              settingId: event.data.settingId,
              submenu: event.data.submenu,
              isActive: isSettingActive,
            },
            "*"
          );
          break;

        case "HEADER_SETTING_SELECTED":
          // Log for debugging
          console.log("HEADER_SETTING_SELECTED received:", event.data);

          // Get the new setting ID and submenu
          const newSettingId = event.data.settingId;
          const directNav = event.data.directNav;

          // Find the appropriate submenu for this setting
          let submenuToSelect = event.data.submenu;

          if (!submenuToSelect) {
            // If no submenu specified, try to determine from settingId
            const settingId = event.data.settingId;

            // Determine submenu based on settingId patterns
            if (settingId?.startsWith("html_block_")) {
              submenuToSelect = "HTML";
            } else if (settingId === "logo") {
              submenuToSelect = "Header Main Setting";
            } else if (settingId === "mainMenu" || settingId === "topBarMenu") {
              submenuToSelect = "Header Navigation Setting";
            } else if (settingId === "search") {
              submenuToSelect = "Header Search Setting";
            } else if (settingId?.startsWith("button_")) {
              submenuToSelect = "Buttons";
            } else if (
              settingId === "social_icon" ||
              settingId === "followIcons"
            ) {
              submenuToSelect = "Social";
            } else if (settingId?.includes("top_") || settingId === "contact") {
              submenuToSelect = "Top Bar Setting";
            } else if (settingId?.includes("bottom_")) {
              submenuToSelect = "Header Bottom Setting";
            } else if (settingId?.includes("divider")) {
              submenuToSelect = "Header Main Setting";
            } else if (
              settingId === "account" ||
              settingId === "cart" ||
              settingId === "wishlist"
            ) {
              submenuToSelect = "Header Main Setting";
            }
          }

          // Check if we're already on the correct panel with the right submenu and setting
          const alreadyOnCorrectPanel =
            currentSubmenu === submenuToSelect &&
            selectedHeaderSetting === newSettingId;

          if (alreadyOnCorrectPanel) {
            console.log(
              `Already on the correct panel: ${submenuToSelect} with setting: ${newSettingId}, skipping update`
            );
            return; // Exit early, no changes needed
          }

          // Handle direct navigation to prevent flickering - update state first, then toggle sidebar
          if (directNav) {
            // Update both the setting and submenu before toggling the sidebar
            if (selectedHeaderSetting !== newSettingId) {
              setSelectedHeaderSetting(newSettingId);
            }

            if (submenuToSelect && currentSubmenu !== submenuToSelect) {
              setCurrentSubmenu(submenuToSelect);
            }

            // Now toggle the sidebar with the state already updated
            toggleNarrowSidebar("header-settings");
          } else {
            // Legacy behavior - might cause flickering due to state updates after sidebar toggle
            if (selectedHeaderSetting !== newSettingId) {
              setSelectedHeaderSetting(newSettingId);
            }

            toggleNarrowSidebar("header-settings");

            if (submenuToSelect && currentSubmenu !== submenuToSelect) {
              setCurrentSubmenu(submenuToSelect);
            }
          }
          break;

        case "HEADER_PRESET_LOADED":
          // Update the current preset state when the header loads a preset
          if (event.data.presetId) {
            setCurrentPreset(event.data.presetId);
          }
          break;

        case "GET_PRESET_DATA":
          // The iframe is requesting preset data
          // Import the preset layouts and send them back to the iframe
          import("./data/headerPresets")
            .then(({ presetLayouts }) => {
              const { presetId } = event.data;
              if (presetId && presetLayouts[presetId]) {
                // Update the current preset state
                setCurrentPreset(presetId);

                // Send the preset layout data to the iframe
                contentRef.current?.contentWindow?.postMessage(
                  {
                    type: "UPDATE_HEADER_LAYOUT",
                    presetId,
                    ...presetLayouts[presetId],
                  },
                  "*"
                );
              }
            })
            .catch((error) => {
              console.error("Error loading header presets:", error);
            });
          break;
      }
    };

    // Update the headerSettingsRequested event handler to be more robust
    const handleHeaderSettingsRequested = (event: CustomEvent) => {
      console.log("headerSettingsRequested event received:", event.detail);

      const { settingId, submenu, itemType } = event.detail;

      // Determine the submenu to show
      let submenuToUse = submenu;

      // If no submenu was provided, try to infer from the item type or setting ID
      if (!submenuToUse) {
        if (settingId?.startsWith("html_block_")) {
          submenuToUse = "HTML";
        } else if (itemType) {
          // Logic to determine submenu from item type if needed
          if (itemType.includes("logo")) {
            submenuToUse = "Header Main Setting";
          } else if (itemType.includes("menu")) {
            submenuToUse = "Header Navigation Setting";
          } else if (itemType.includes("search")) {
            submenuToUse = "Header Search Setting";
          } else if (itemType.includes("button")) {
            submenuToUse = "Buttons";
          } else if (itemType.includes("social")) {
            submenuToUse = "Social";
          }
        }
      }

      // Check if we're already on the correct panel with the right submenu
      const alreadyOnCorrectPanel =
        currentSubmenu === submenuToUse && selectedHeaderSetting === settingId;

      if (alreadyOnCorrectPanel) {
        console.log(
          `Already on the correct panel: ${submenuToUse} with setting: ${settingId}, skipping update`
        );
        return; // Exit early, no changes needed
      }

      // Set the selected setting only if it has changed
      if (settingId && selectedHeaderSetting !== settingId) {
        setSelectedHeaderSetting(settingId);
        console.log(`Selected header setting: ${settingId}`);
      }

      // Open the header settings sidebar
      toggleNarrowSidebar("header-settings");

      // Set the submenu if we have one and it's different
      if (submenuToUse && currentSubmenu !== submenuToUse) {
        console.log(`Setting submenu to ${submenuToUse}`);
        setCurrentSubmenu(submenuToUse);
      } else if (
        settingId?.startsWith("html_block_") &&
        currentSubmenu !== "HTML"
      ) {
        setCurrentSubmenu("HTML");
      }
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener("message", handleHeaderSettingSelected);
    window.addEventListener(
      "headerSettingsRequested",
      handleHeaderSettingsRequested as EventListener
    );

    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener("message", handleHeaderSettingSelected);
      window.removeEventListener(
        "headerSettingsRequested",
        handleHeaderSettingsRequested as EventListener
      );
    };
  }, [
    toggleNarrowSidebar,
    currentSubmenu,
    selectedHeaderSetting,
    activeSubmenu,
    contentRef,
  ]);

  useEffect(() => {
    setCurrentSubmenu(activeSubmenu || null);
  }, [activeSubmenu]);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  // Fix the error by safely accessing the type property
  const sectionTitle =
    selectedSection && selectedSection.type
      ? `${selectedSection.type
          .charAt(0)
          .toUpperCase()}${selectedSection.type.slice(1)} Settings`
      : SECTION_SETTINGS_TAB;

  const handleMenuItemClick = useCallback(
    (item: any) => {
      const isHeaderSubmenuItem = item.parent === "Header";

      // Prevent any auto-save operations during menu item clicks
      if (!isHeaderSubmenuItem && item.title !== "Header") {
        toggleNarrowSidebar("layers");
        setCurrentSubmenu(null);
      } else {
        // For header-related items, just update the UI state
        toggleNarrowSidebar("header-settings");
      }

      if (item.onClick) {
        item.onClick();
      }
    },
    [toggleNarrowSidebar]
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      setCurrentPreset(presetId);

      // Send message to iframe to update the header layout
      contentRef.current?.contentWindow?.postMessage(
        {
          type: "SELECT_PRESET",
          presetId,
        },
        "*"
      );

      // Don't switch submenu - stay on current layout panel
      // This allows the user to see the change immediately without navigating away
    },
    [contentRef]
  );

  const handleUpdateSettings = (updates: any) => {
    // Send message to iframe to update settings
    contentRef.current?.contentWindow?.postMessage(
      {
        type: "UPDATE_HEADER_SETTINGS",
        settings: updates,
      },
      "*"
    );
  };

  const headerMenuItems = [
    {
      title: "Layout",
      component: HeaderLayoutsPanel,
      componentProps: {
        onSelectPreset: handleSelectPreset,
        currentPreset,
      },
      icon: LayoutPanelLeft,
      parent: "Header",
    },
    {
      title: "Top Bar Setting",
      component: TopBarSettingsPanel,
      icon: AppWindow,
      parent: "Header",
    },
    {
      title: "Header Main Setting",
      component: HeaderMainSettings,
      icon: Type,
      parent: "Header",
    },
    {
      title: "Header Bottom Setting",
      component: HeaderBottomSettings,
      icon: Image,
      parent: "Header",
    },
    {
      title: "Header Navigation Setting",
      component: HeaderNavigationSettings,
      icon: PanelRight,
      parent: "Header",
    },
    {
      title: "Header Search Setting",
      component: HeaderSearchSettings,
      icon: Settings,
      parent: "Header",
    },
    {
      title: "Account Setting",
      component: HeaderAccountSettings,
      icon: User,
      parent: "Header",
    },
    {
      title: "Buttons",
      component: HeaderButtonSettings,
      icon: Layers,
      parent: "Header",
    },
    {
      title: "Social",
      component: HeaderSocialSettings,
      icon: LayoutPanelLeft,
      parent: "Header",
    },
    {
      title: "HTML",
      component: HeaderHtmlSettings,
      componentProps: { selectedSetting: selectedHeaderSetting },
      icon: AppWindow,
      parent: "Header",
    },
  ];

  const footerMenuItems = [
    {
      title: "Footer Settings",
      component: FooterSettingsPanel,
      icon: PanelRight,
      parent: "Footer",
    },
  ];

  const initialMenu = {
    title: "Main Menu",
    items: [
      {
        title: "Design",
        component: SortableLayersPanel,
        componentProps: {
          sections: localSections,
          selectedSectionId,
          onSelectSection: (sectionId: string) => {
            onSelectSection(sectionId);
            window.dispatchEvent(
              new CustomEvent("switchTab", {
                detail: { targetTab: SECTION_SETTINGS_TAB },
              })
            );
          },
          onHoverSection,
          contentRef,
          setSections: setLocalSections,
        },
        icon: DesignIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Header",
        subMenu: headerMenuItems,
        icon: HeaderIcon,
        onClick: () => {
          toggleNarrowSidebar("header-settings");
        },
      },
      {
        title: "Footer",
        subMenu: footerMenuItems,
        icon: FooterIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Global Settings Panel",
        component: GlobalSettingsPanel,
        icon: GlobalSettingsIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "SEO",
        component: SEOSettingsPanel,
        icon: SEOIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Page Setting",
        component: PageSettingsPanel,
        icon: PageSettingIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: SECTION_SETTINGS_TAB,
        component: () => (
          <div>
            <div className="flex items-center gap-2 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("switchTab", {
                      detail: { targetTab: "Design" },
                    })
                  );
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-md font-semibold">{sectionTitle}</span>
            </div>
            <SectionSettingsPanel
              selectedSectionId={selectedSectionId}
              sections={sections}
              contentRef={contentRef}
              settingsPanelRef={settingsPanelRef}
            />
          </div>
        ),
        icon: AppWindow,
        hidden: true,
      },
    ],
  };

  return (
    <ScrollArea className="h-full">
      <MultiLevelSidebar
        initialMenu={initialMenu}
        onNavigate={(item) => {
          console.log("MultiLevelSidebar: Navigated to:", item.title);
          setCurrentSubmenu(item.title);
        }}
        onBack={() => {
          console.log("MultiLevelSidebar: Went back");
          setCurrentSubmenu(null);
        }}
        onMenuItemClick={handleMenuItemClick}
        defaultSubmenu={currentSubmenu}
      />
    </ScrollArea>
  );
}
