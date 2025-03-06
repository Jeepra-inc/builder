import React, { useRef, useState } from "react";
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
import { Upload, AlertCircle, Check, FileJson } from "lucide-react";
import { Section } from "@/app/builder/types";
import {
  validateTemplateImport,
  TemplateExport,
} from "@/app/builder/utils/templateExporter";

interface ImportTemplateButtonProps {
  onImportSections: (sections: Section[]) => void;
}

export function ImportTemplateButton({
  onImportSections,
}: ImportTemplateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError("Please select a file to import");
      return;
    }

    try {
      // Read the file
      const fileContent = await readFileAsText(selectedFile);

      // Parse the JSON
      const templateData = JSON.parse(fileContent);

      // Validate the template data
      if (!validateTemplateImport(templateData)) {
        setImportError("Invalid template file format");
        return;
      }

      // Import the sections
      onImportSections(templateData.sections);

      // Show success message
      setImportSuccess(true);
      setImportError(null);

      // Close dialog after a delay
      setTimeout(() => {
        setImportSuccess(false);
        setIsDialogOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to import template:", error);
      setImportError(
        "Failed to import template. Please check the file format."
      );
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          className="flex items-center gap-2 h-8"
        >
          <Upload className="h-4 w-4" />
          <span>Import Template</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Import a previously exported template JSON file to restore your
            design.
          </DialogDescription>
        </DialogHeader>

        {importSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-lg font-medium">
              Template imported successfully!
            </p>
          </div>
        ) : (
          <>
            {importError && (
              <div className="bg-red-50 p-3 rounded-md flex items-start space-x-2 text-red-700 mb-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error importing template</p>
                  <p className="text-sm">{importError}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-lg font-semibold">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFileSelect}
                      className="mt-2"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileJson className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Click to select a template JSON file or drag and drop it
                      here
                    </p>
                    <Button onClick={handleFileSelect}>Select File</Button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!selectedFile}>
                Import
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
