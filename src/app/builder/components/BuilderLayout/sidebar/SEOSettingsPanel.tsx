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
import { ScrollArea } from "@/components/ui/scroll-area";

export function SEOSettingsPanel() {
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
                {/* ... rest of general settings content */}
              </AccordionContent>
            </AccordionItem>

            {/* Social Media Settings */}
            <AccordionItem value="social">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Social Media</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                {/* ... rest of social media content */}
              </AccordionContent>
            </AccordionItem>

            {/* Advanced Settings */}
            <AccordionItem value="advanced">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Advanced</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                {/* ... rest of advanced settings */}
              </AccordionContent>
            </AccordionItem>

            {/* Sitemap Settings */}
            <AccordionItem value="sitemap">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Sitemap</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                {/* ... rest of sitemap content */}
              </AccordionContent>
            </AccordionItem>

            {/* Breadcrumbs Settings */}
            <AccordionItem value="breadcrumbs">
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <span>Breadcrumbs</span>
              </AccordionTrigger>
              <AccordionContent className="p-3 space-y-4">
                {/* ... rest of breadcrumbs content */}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
