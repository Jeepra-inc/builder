// import React, { useRef, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Save, Upload, Download, AlertCircle } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { GlobalSettings, exportSettings, importSettings } from '@/app/builder/utils/settingsStorage';

// interface SaveLoadButtonsProps {
//   settings: GlobalSettings;
//   onSave: () => void;
//   onImport: (settings: GlobalSettings) => void;
// }

// export function SaveLoadButtons({ settings, onSave, onImport }: SaveLoadButtonsProps) {
//   const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
//   const [importError, setImportError] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleExport = () => {
//     exportSettings(settings);
//   };

//   const handleImportClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       setImportError(null);
//       const importedSettings = await importSettings(file);
//       onImport(importedSettings);
//       setIsImportDialogOpen(false);
//       // Reset the file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (error) {
//       console.error('Import error:', error);
//       setImportError((error as Error).message || 'Failed to import settings');
//     }
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button variant="outline" size="icon" onClick={onSave}>
//             <Save className="h-4 w-4" />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent>Save Settings</TooltipContent>
//       </Tooltip>

//       <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
//         <DialogTrigger asChild>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Button variant="outline" size="icon" onClick={() => setIsImportDialogOpen(true)}>
//                 <Upload className="h-4 w-4" />
//               </Button>
//             </TooltipTrigger>
//             <TooltipContent>Import Settings</TooltipContent>
//           </Tooltip>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Import Settings</DialogTitle>
//             <DialogDescription>
//               Upload a JSON file containing your saved settings.
//               This will replace your current settings.
//             </DialogDescription>
//           </DialogHeader>

//           {importError && (
//             <div className="bg-red-50 p-3 rounded-md flex items-start space-x-2 text-red-700">
//               <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
//               <div>
//                 <p className="font-medium">Error importing settings</p>
//                 <p className="text-sm">{importError}</p>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-center p-6">
//             <Button onClick={handleImportClick}>
//               <Upload className="mr-2 h-4 w-4" />
//               Select File
//             </Button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".json"
//               className="hidden"
//               onChange={handleFileChange}
//             />
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Button variant="outline" size="icon" onClick={handleExport}>
//             <Download className="h-4 w-4" />
//           </Button>
//         </TooltipTrigger>
//         <TooltipContent>Export Settings</TooltipContent>
//       </Tooltip>
//     </div>
//   );
// }
