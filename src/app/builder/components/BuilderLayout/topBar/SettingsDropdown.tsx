// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Settings, Check } from 'lucide-react';
// import { getAvailableSettingsFiles, GlobalSettings, loadSettingsFromUrl } from '@/app/builder/utils/settingsStorage';

// interface SettingsDropdownProps {
//   onSelectSettings: (settings: GlobalSettings) => void;
// }

// export function SettingsDropdown({ onSelectSettings }: SettingsDropdownProps) {
//   const [availableSettings, setAvailableSettings] = useState<string[]>([]);
//   const [selectedSetting, setSelectedSetting] = useState<string>('default');
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   useEffect(() => {
//     const loadAvailableSettings = async () => {
//       const settings = await getAvailableSettingsFiles();
//       setAvailableSettings(settings);
//     };

//     loadAvailableSettings();
//   }, []);

//   const handleSelectSetting = async (settingName: string) => {
//     try {
//       setIsLoading(true);
//       const url = `/settings/${settingName}.json`;
//       const settings = await loadSettingsFromUrl(url);

//       onSelectSettings(settings);
//       setSelectedSetting(settingName);
//     } catch (error) {
//       console.error(`Failed to load settings from ${settingName}:`, error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatSettingName = (name: string): string => {
//     return name
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="icon" disabled={isLoading}>
//           <Settings className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {availableSettings.map((setting) => (
//           <DropdownMenuItem
//             key={setting}
//             onClick={() => handleSelectSetting(setting)}
//             className="flex items-center justify-between"
//           >
//             <span>{formatSettingName(setting)}</span>
//             {selectedSetting === setting && <Check className="h-4 w-4 ml-2" />}
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
