import { Section } from '../types';

// Define the structure for template export
export interface TemplateExport {
  sections: Section[];
  html: string;
  css?: string;
  version: string;
}

/**
 * Generates HTML for a section based on its type and settings
 */
const generateSectionHTML = (section: Section): string => {
  const { type, settings } = section;
  
  // Basic HTML structure based on section type
  switch (type) {
    case 'hero':
      return `
<section class="hero-section" id="section-${section.id}">
  <div class="container">
    <h1>${settings.title || 'Hero Title'}</h1>
    ${settings.subtitle ? `<h2>${settings.subtitle}</h2>` : ''}
    ${settings.description ? `<p>${settings.description}</p>` : ''}
    ${settings.buttonText ? `<a href="${settings.buttonLink || '#'}" class="btn btn-${settings.buttonStyle || 'primary'}">${settings.buttonText}</a>` : ''}
  </div>
</section>`;
    
    case 'banner':
    case 'newBanner':
    case 'modernBanner':
      return `
<section class="banner-section" id="section-${section.id}">
  <div class="container text-${settings.textAlignment || 'center'}">
    ${settings.title ? `<h2>${settings.title}</h2>` : ''}
    ${settings.description ? `<p>${settings.description}</p>` : ''}
    ${settings.buttonText ? `<a href="${settings.buttonLink || '#'}" class="btn btn-${settings.buttonStyle || 'primary'}">${settings.buttonText}</a>` : ''}
  </div>
</section>`;
    
    default:
      return `
<section class="section ${type}-section" id="section-${section.id}">
  <div class="container">
    <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Section</h2>
    <p>This is a ${type} section.</p>
  </div>
</section>`;
  }
};

/**
 * Generates CSS for the template based on sections
 */
const generateTemplateCSS = (sections: Section[]): string => {
  let css = `
/* Base styles */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --text-color: #1f2937;
  --background-color: #ffffff;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-color);
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

section {
  padding: 4rem 0;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  line-height: 1.2;
}

p {
  margin-bottom: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Section specific styles */
`;

  // Add section-specific styles
  sections.forEach(section => {
    const { type, settings } = section;
    
    switch (type) {
      case 'hero':
        css += `
.hero-section {
  background-color: ${settings.backgroundColor || '#f3f4f6'};
  color: ${settings.textColor || 'var(--text-color)'};
  padding: ${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px 0;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}
`;
        break;
      
      case 'banner':
      case 'newBanner':
      case 'modernBanner':
        css += `
.banner-section {
  background-color: ${settings.backgroundColor || '#f3f4f6'};
  color: ${settings.textColor || 'var(--text-color)'};
  padding: ${settings.paddingTop || 40}px 0 ${settings.paddingBottom || 40}px 0;
}

.banner-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
`;
        break;
    }
  });

  return css;
};

/**
 * Generates a complete HTML document from sections
 */
const generateTemplateHTML = (sections: Section[]): string => {
  const sectionsHTML = sections.map(section => generateSectionHTML(section)).join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Template</title>
  <style>
    /* Inline CSS for simplicity */
    ${generateTemplateCSS(sections)}
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
};

/**
 * Exports the template as a downloadable file
 */
export const exportTemplate = (sections: Section[], templateName: string = 'template'): TemplateExport => {
  // Generate HTML from sections
  const html = generateTemplateHTML(sections);
  const css = generateTemplateCSS(sections);
  
  // Create the export object
  const templateExport: TemplateExport = {
    sections,
    html,
    css,
    version: '1.0.0'
  };
  
  return templateExport;
};

/**
 * Validates an imported template
 */
export const validateTemplateImport = (data: any): data is TemplateExport => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.sections) &&
    typeof data.html === 'string' &&
    typeof data.version === 'string'
  );
};

/**
 * Downloads the template as HTML file
 */
export const downloadTemplateAsHTML = (sections: Section[], templateName: string = 'template'): void => {
  const html = generateTemplateHTML(sections);
  
  // Create a blob and download link
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${templateName}.html`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Downloads the template as JSON file
 */
export const downloadTemplateAsJSON = (sections: Section[], templateName: string = 'template'): void => {
  const templateExport = exportTemplate(sections, templateName);
  
  // Convert to JSON string with pretty formatting
  const dataStr = JSON.stringify(templateExport, null, 2);
  
  // Create a blob and download link
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create and trigger download
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${templateName}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up
  URL.revokeObjectURL(url);
};