/**
 * META.js Customizer - Main App Controller
 *
 * Modern, accessible web app for generating custom META.js
 * using service rulesets from the xixu-me/RFM repository.
 *
 * Features:
 * - Component-based architecture with separation of concerns
 * - Modern ES6+ JavaScript with module imports
 * - Comprehensive error handling and user feedback
 * - Accessibility-first design with ARIA support
 * - Performance optimizations and caching
 *
 * @author xixu-me
 * @license GPL-3.0
 */

import { OutputManager } from "./components/OutputManager.js";
import { ServiceConfigGenerator } from "./components/ServiceConfigGenerator.js";
import { ServicesManager } from "./components/ServicesManager.js";
import { ThemeManager } from "./components/ThemeManager.js";

export class MetaJSCustomizer {
  constructor() {
    this.components = {};
    this.isInitialized = false;

    this.init();
  }

  /**
   * Initialize the app
   */
  async init() {
    try {
      this.showLoadingState();

      // Initialize components in order
      await this.initializeComponents();

      // Set up global error handling
      this.setupErrorHandling();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      this.hideLoadingState();
      this.isInitialized = true;

      console.log("META.js Customizer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize META.js Customizer:", error);
      this.showInitializationError(error);
    }
  }

  /**
   * Initialize all app components
   */
  async initializeComponents() {
    // Initialize theme manager first (no dependencies)
    this.components.themeManager = new ThemeManager();

    // Initialize service config generator (no dependencies)
    this.components.serviceConfigGenerator = new ServiceConfigGenerator();

    // Initialize services manager (depends on API)
    this.components.servicesManager = new ServicesManager();

    // Initialize output manager (depends on service config generator)
    this.components.outputManager = new OutputManager(
      this.components.serviceConfigGenerator
    );

    // Wait for services to load
    await this.waitForServicesLoad();
  }

  /**
   * Wait for services to load with timeout
   * @returns {Promise<void>}
   */
  async waitForServicesLoad() {
    const timeout = 10000; // 10 seconds timeout
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkServices = () => {
        if (this.components.servicesManager.isLoaded()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Services loading timeout"));
        } else {
          setTimeout(checkServices, 100);
        }
      };

      checkServices();
    });
  }

  /**
   * Set up global error handling
   */
  setupErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showError("An unexpected error occurred. Please refresh the page.");
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      console.error("JavaScript error:", event.error);
      this.showError("An unexpected error occurred. Please refresh the page.");
    });
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor long tasks that block the main thread
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          });
        });

        observer.observe({ entryTypes: ["longtask"] });
      } catch (error) {
        console.warn("Performance monitoring not available:", error);
      }
    }
  }

  /**
   * Show app loading state
   */
  showLoadingState() {
    const container = document.querySelector(".container");
    if (container) {
      container.classList.add("loading");

      // Add loading indicator if not exists
      if (!document.querySelector(".app-loading")) {
        const loading = document.createElement("div");
        loading.className = "app-loading";
        loading.innerHTML = `
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading META.js Customizer...</p>
        `;
        container.appendChild(loading);
      }
    }
  }

  /**
   * Hide app loading state
   */
  hideLoadingState() {
    const container = document.querySelector(".container");
    const loading = document.querySelector(".app-loading");

    if (container) {
      container.classList.remove("loading");
    }

    if (loading) {
      loading.remove();
    }
  }

  /**
   * Show initialization error
   * @param {Error} error - Initialization error
   */
  showInitializationError(error) {
    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `
        <div class="initialization-error">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Failed to Initialize</h2>
          <p>META.js Customizer failed to load properly.</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message}</pre>
          </details>
          <button onclick="window.location.reload()" class="btn btn-primary">
            <i class="fas fa-refresh"></i> Reload Page
          </button>
        </div>
      `;
    }
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    // Create or update error toast
    let errorToast = document.querySelector(".error-toast");

    if (!errorToast) {
      errorToast = document.createElement("div");
      errorToast.className = "error-toast";
      document.body.appendChild(errorToast);
    }

    errorToast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentNode.parentNode.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    errorToast.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorToast && errorToast.parentNode) {
        errorToast.remove();
      }
    }, 5000);
  }

  /**
   * Get component instance
   * @param {string} componentName - Name of component
   * @returns {Object|null} Component instance or null
   */
  getComponent(componentName) {
    return this.components[componentName] || null;
  }

  /**
   * Check if app is ready
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Destroy app and cleanup
   */
  destroy() {
    // Cleanup components if they have destroy methods
    Object.values(this.components).forEach((component) => {
      if (typeof component.destroy === "function") {
        component.destroy();
      }
    });

    this.components = {};
    this.isInitialized = false;
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Make app instance globally available for debugging
  window.metaJSCustomizer = new MetaJSCustomizer();
});

// Export for module usage
export default MetaJSCustomizer;
