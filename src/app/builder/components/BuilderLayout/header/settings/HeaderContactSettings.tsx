"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderContactSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
}

export function HeaderContactSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
}: HeaderContactSettingsProps) {
  // Initialize default values from settings or use empty values
  const [email, setEmail] = useState<string>(settings.contact?.email || "");

  const [emailLabel, setEmailLabel] = useState<string>(
    settings.contact?.emailLabel || "Email"
  );

  const [phone, setPhone] = useState<string>(settings.contact?.phone || "");

  const [location, setLocation] = useState<string>(
    settings.contact?.location || ""
  );

  const [locationLabel, setLocationLabel] = useState<string>(
    settings.contact?.locationLabel || "Location"
  );

  const [openHours, setOpenHours] = useState<string>(
    settings.contact?.openHours || "Open Hours"
  );

  const [hoursDetails, setHoursDetails] = useState<string>(
    settings.contact?.hoursDetails ||
      "Mon-Fri: 9am - 5pm\nSat: 10am - 2pm\nSun: Closed"
  );

  const [showContact, setShowContact] = useState<boolean>(
    settings.contact?.show !== false
  );

  // Function to update settings
  const handleUpdate = (field: string, value: any) => {
    if (!onUpdateSettings) return;

    // Create a new settings object to avoid mutation
    const updatedSettings = {
      ...settings,
      contact: {
        ...settings.contact,
        [field]: value,
        show: showContact,
      },
    };

    // Optional: Preview how it would look in iframe
    console.log("Updating contact settings:", updatedSettings);

    // Call the update function
    onUpdateSettings(updatedSettings);
  };

  return (
    <div className="space-y-4">
      <SettingSection title="Contact Information">
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="show-contact" className="font-normal">
            Show Contact Information
          </Label>
          <Switch
            id="show-contact"
            checked={showContact}
            onCheckedChange={(checked) => {
              setShowContact(checked);
              handleUpdate("show", checked);
            }}
          />
        </div>
      </SettingSection>

      {showContact && (
        <>
          <SettingSection title="Email">
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="email-label">Email Label</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Input
                    id="email-label"
                    value={emailLabel}
                    onChange={(e) => {
                      setEmailLabel(e.target.value);
                      handleUpdate("emailLabel", e.target.value);
                    }}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    handleUpdate("email", e.target.value);
                  }}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Phone">
            <div className="grid gap-2 py-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <Input
                  id="phone-number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    handleUpdate("phone", e.target.value);
                  }}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Location">
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="location-label">Location Label</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input
                    id="location-label"
                    value={locationLabel}
                    onChange={(e) => {
                      setLocationLabel(e.target.value);
                      handleUpdate("locationLabel", e.target.value);
                    }}
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location-address">Location Address</Label>
                <Input
                  id="location-address"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    handleUpdate("location", e.target.value);
                  }}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection title="Hours">
            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="hours-label">Hours Label</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="hours-label"
                    value={openHours}
                    onChange={(e) => {
                      setOpenHours(e.target.value);
                      handleUpdate("openHours", e.target.value);
                    }}
                    placeholder="Open Hours"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hours-details">Hours Details</Label>
                <Textarea
                  id="hours-details"
                  value={hoursDetails}
                  onChange={(e) => {
                    setHoursDetails(e.target.value);
                    handleUpdate("hoursDetails", e.target.value);
                  }}
                  placeholder="Mon-Fri: 9am - 5pm&#10;Sat: 10am - 2pm&#10;Sun: Closed"
                  rows={4}
                />
              </div>
            </div>
          </SettingSection>
        </>
      )}
    </div>
  );
}
