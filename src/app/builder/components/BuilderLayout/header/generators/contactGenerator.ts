import { HeaderSettings } from "../types";

/**
 * Generate HTML for the contact information component based on settings
 */
export const generateContactHTML = (settings: HeaderSettings): string => {
  // Get contact settings with defaults
  const contactSettings = settings.contact || {
    show: true,
    email: "",
    emailLabel: "Email",
    phone: "",
    location: "",
    locationLabel: "Location",
    openHours: "Open Hours",
    hoursDetails: "Mon-Fri: 9am - 5pm\nSat: 10am - 2pm\nSun: Closed",
  };

  // Return empty if contact is disabled
  if (contactSettings.show === false) {
    return "";
  }

  // Generate HTML for contact info
  let contactHTML = `
    <div class="contact-info-container" data-item-id="contact" style="display: flex; flex-direction: column; gap: 5px;">
  `;

  // Add email if provided
  if (contactSettings.email) {
    contactHTML += `
      <div class="contact-item email" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span class="contact-label">${contactSettings.emailLabel}: </span>
        <a href="mailto:${contactSettings.email}" class="contact-value">${contactSettings.email}</a>
      </div>
    `;
  }

  // Add phone if provided
  if (contactSettings.phone) {
    contactHTML += `
      <div class="contact-item phone" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <a href="tel:${contactSettings.phone}" class="contact-value">${contactSettings.phone}</a>
      </div>
    `;
  }

  // Add location if provided
  if (contactSettings.location) {
    contactHTML += `
      <div class="contact-item location" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span class="contact-label">${contactSettings.locationLabel}: </span>
        <span class="contact-value">${contactSettings.location}</span>
      </div>
    `;
  }

  // Add hours if provided
  if (contactSettings.openHours && contactSettings.hoursDetails) {
    contactHTML += `
      <div class="contact-item hours" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="contact-label">${contactSettings.openHours}</span>
        <div class="contact-hours-details" style="display: none; position: absolute; background: white; padding: 10px; border: 1px solid #eee; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100; white-space: pre-line;">
          ${contactSettings.hoursDetails.replace(/\n/g, "<br>")}
        </div>
      </div>
    `;
  }

  contactHTML += `</div>`;
  return contactHTML;
};
