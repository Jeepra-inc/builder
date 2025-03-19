// import { useEffect } from "react";
// import { HeaderSettings } from "../types";
// // import { handleColorSchemeSelection } from "../cssUtils";
// import { sendMessageToParent } from "../notifications";

// /**
//  * Custom hook for handling color scheme logging and updates
//  */
// export const useColorSchemeEffects = (
//   headerSettings: HeaderSettings,
//   setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>
// ): void => {
//   // Log color scheme changes for debugging
//   useEffect(() => {
//     console.log("Current color schemes:", {
//       top: headerSettings.topBarColorScheme,
//       main: headerSettings.mainBarColorScheme,
//       bottom: headerSettings.bottomBarColorScheme,
//     });
//   }, [
//     headerSettings.topBarColorScheme,
//     headerSettings.mainBarColorScheme,
//     headerSettings.bottomBarColorScheme,
//   ]);

//   // Special handler to ensure color scheme changes are reflected
//   useEffect(() => {
//     // Force iframe to repaint when color schemes change
//     const forceRepaint = () => {
//       try {
//         // Try to notify parent about current color schemes
//         sendMessageToParent({
//           type: "HEADER_COLOR_SCHEMES_UPDATE",
//           schemes: {
//             top: headerSettings.topBarColorScheme || "light",
//             main: headerSettings.mainBarColorScheme || "light",
//             bottom: headerSettings.bottomBarColorScheme || "light",
//           },
//         });

//         console.log("Forced color scheme update notification");

//         // Force a repaint in the iframe if possible
//         try {
//           // Add a dummy class and remove it to force a repaint
//           document.body.classList.add("force-repaint");
//           setTimeout(() => {
//             document.body.classList.remove("force-repaint");
//           }, 10);
//         } catch (e) {
//           console.warn("Could not force repaint:", e);
//         }
//       } catch (e) {
//         console.error("Error notifying parent about color schemes:", e);
//       }
//     };

//     // Call immediately
//     forceRepaint();

//     // Create a message handler that uses our imported handleColorSchemeSelection
//     // const colorSchemeMessageHandler = (event: MessageEvent) => {
//     //   handleColorSchemeSelection(event, setHeaderSettings, forceRepaint);
//     // };

//     // window.addEventListener("message", colorSchemeMessageHandler);

//     // return () => {
//     //   window.removeEventListener("message", colorSchemeMessageHandler);
//     // };
//   }, [
//     headerSettings.topBarColorScheme,
//     headerSettings.mainBarColorScheme,
//     headerSettings.bottomBarColorScheme,
//     setHeaderSettings,
//   ]);
// };
