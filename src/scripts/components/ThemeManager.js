/**
 * Theme Manager Component
 *
 * Handles theme detection, switching, and persistence with support for:
 * - System theme detection with auto-switching
 * - Manual theme override (light/dark/auto)
 * - Smooth theme transitions with CSS custom properties
 * - LocalStorage persistence
 *
 * @author xixu-me
 * @license GPL-3.0
 */

export class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.themes = ["auto", "light", "dark"];
    this.currentThemeIndex = 0;

    this.init();
  }

  /**
   * Initialize theme system
   */
  init() {
    this.setupTheme();
    this.setupEventListeners();
    this.setupSystemThemeListener();
  }

  /**
   * Get current system theme preference
   * @returns {string} 'dark' or 'light'
   */
  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Set up initial theme based on saved preference or system theme
   */
  setupTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme && this.themes.includes(savedTheme)) {
      this.currentThemeIndex = this.themes.indexOf(savedTheme);
    }

    this.applyTheme();
  }

  /**
   * Apply current theme to document
   */
  applyTheme() {
    const currentTheme = this.themes[this.currentThemeIndex];

    if (currentTheme === "auto") {
      const systemTheme = this.getSystemTheme();
      document.documentElement.setAttribute("data-theme", systemTheme);
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", currentTheme);
      localStorage.setItem("theme", currentTheme);
    }

    this.updateThemeIcon();
  }

  /**
   * Update theme toggle button icon and tooltip
   */
  updateThemeIcon() {
    const currentTheme = this.themes[this.currentThemeIndex];
    const icon = this.themeToggle.querySelector("i");

    const iconMap = {
      auto: "fas fa-circle-half-stroke",
      light: "fas fa-sun",
      dark: "fas fa-moon",
    };

    const tooltipMap = {
      auto: "Theme: Auto (following system)",
      light: "Theme: Light",
      dark: "Theme: Dark",
    };

    icon.className = iconMap[currentTheme];
    this.themeToggle.title = tooltipMap[currentTheme];
    this.themeToggle.setAttribute("aria-label", tooltipMap[currentTheme]);
  }

  /**
   * Cycle to next theme
   */
  toggleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    this.applyTheme();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  /**
   * Listen for system theme changes and apply when in auto mode
   */
  setupSystemThemeListener() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (this.themes[this.currentThemeIndex] === "auto") {
          this.applyTheme();
        }
      });
  }
}
