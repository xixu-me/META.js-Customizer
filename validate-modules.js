/**
 * Module Validation Script
 *
 * Simple script to validate that all ES6 modules can be imported correctly
 * and that the basic structure is working as expected.
 */

// Validate that all components can be imported
try {
  import("./src/scripts/components/ThemeManager.js")
    .then((module) => {
      console.log("✓ ThemeManager module loaded successfully");
      return import("./src/scripts/components/ServicesManager.js");
    })
    .then((module) => {
      console.log("✓ ServicesManager module loaded successfully");
      return import("./src/scripts/components/ServiceConfigGenerator.js");
    })
    .then((module) => {
      console.log("✓ ServiceConfigGenerator module loaded successfully");
      return import("./src/scripts/components/OutputManager.js");
    })
    .then((module) => {
      console.log("✓ OutputManager module loaded successfully");
      return import("./src/scripts/app.js");
    })
    .then((module) => {
      console.log("✓ Main app module loaded successfully");
      console.log("🎉 All modules loaded successfully! Architecture is valid.");
    })
    .catch((error) => {
      console.error("❌ Module loading failed:", error);
    });
} catch (error) {
  console.error("❌ Dynamic import not supported:", error);
}
