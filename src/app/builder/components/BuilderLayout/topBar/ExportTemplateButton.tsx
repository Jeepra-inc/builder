import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Check, Code, FileJson } from "lucide-react";
import { Section } from "@/app/builder/types";
import {
  downloadTemplateAsHTML,
  downloadTemplateAsJSON,
} from "@/app/builder/utils/templateExporter";

interface ExportTemplateButtonProps {
  sections: Section[];
}

export function ExportTemplateButton({ sections }: ExportTemplateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("my-template");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<"html" | "json">("html");

  const handleExport = () => {
    try {
      if (exportFormat === "html") {
        downloadTemplateAsHTML(sections, templateName);
      } else {
        downloadTemplateAsJSON(sections, templateName);
      }

      // Show success message
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsDialogOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to export template:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          className="flex items-center gap-2 h-8"
        >
          <Download className="h-4 w-4" />
          <span>Export Template</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Template</DialogTitle>
          <DialogDescription>
            Export your template as HTML or JSON for use in other projects.
          </DialogDescription>
        </DialogHeader>

        {exportSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-lg font-medium">
              Template exported successfully!
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-name" className="text-right">
                  Template Name
                </Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Export Format</Label>
                <div className="col-span-3">
                  <Tabs
                    defaultValue="html"
                    value={exportFormat}
                    onValueChange={(value) =>
                      setExportFormat(value as "html" | "json")
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="html"
                        className="flex items-center gap-2"
                      >
                        <Code className="h-4 w-4" />
                        <span>HTML</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="json"
                        className="flex items-center gap-2"
                      >
                        <FileJson className="h-4 w-4" />
                        <span>JSON</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="mt-2">
                      <p className="text-sm text-gray-500">
                        Export as a standalone HTML file with embedded CSS.
                        Perfect for direct use in websites.
                      </p>
                    </TabsContent>
                    <TabsContent value="json" className="mt-2">
                      <p className="text-sm text-gray-500">
                        Export as JSON with both section data and generated
                        HTML. Ideal for importing back into the builder.
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={sections.length === 0}>
                {sections.length === 0 ? "No sections to export" : "Export"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
