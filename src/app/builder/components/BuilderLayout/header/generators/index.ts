/**
 * Export all HTML generator functions for the header components
 */

export { generateAccountHTML } from "./accountGenerator";
export { generateNavIconHTML } from "./navIconGenerator";
export { generateContactHTML } from "./contactGenerator";

// Re-export existing generators from other files
export { generateMenuHTML } from "../menuUtils";
export { generateSearchHTML } from "../searchSettings";
