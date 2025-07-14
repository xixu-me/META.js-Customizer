/**
 * Output Manager Component
 *
 * Handles META.js generation and output operations including:
 * - Real-time META.js generation from selected services
 * - Clipboard integration with error handling
 * - File download functionality with progress indication
 * - Template management and substitution
 *
 * @author xixu-me
 * @license GPL-3.0
 */

export class OutputManager {
  constructor(serviceConfigGenerator) {
    this.serviceConfigGenerator = serviceConfigGenerator;
    this.templateCache = null;
    this.currentOutput = "";

    this.elements = {
      copyButton: document.getElementById("copyButton"),
      downloadButton: document.getElementById("downloadButton"),
      outputContainer: document.getElementById("output-container"),
    };

    this.init();
  }

  /**
   * Initialize output manager
   */
  init() {
    this.setupEventListeners();
    this.loadTemplate();
    this.setupServiceChangeListener();

    // Initialize with empty output to show "No configuration generated" message
    this.updateOutput("");
    this.setButtonsState(false);
  }

  /**
   * Load META.js template
   */
  async loadTemplate() {
    try {
      // Template is already loaded globally as metaTemplate
      if (typeof metaTemplate !== "undefined") {
        this.templateCache = metaTemplate;
      } else {
        throw new Error("META.js template not found");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      this.showError("Failed to load META.js template");
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.elements.copyButton.addEventListener("click", () =>
      this.copyToClipboard()
    );
    this.elements.downloadButton.addEventListener("click", () =>
      this.downloadFile()
    );
  }

  /**
   * Listen for service selection changes
   */
  setupServiceChangeListener() {
    document.addEventListener("servicesChanged", (event) => {
      this.handleServicesChanged(event.detail.services);
    });
  }

  /**
   * Handle services selection change
   * @param {Array<string>} services - Selected services
   */
  async handleServicesChanged(services) {
    if (services.length === 0) {
      this.updateOutput("");
      this.setButtonsState(false);
    } else {
      this.setButtonsState(true, "Generating...");

      try {
        const output = await this.generateOutput(services);
        this.updateOutput(output);
        this.setButtonsState(true);
      } catch (error) {
        console.error("Failed to generate output:", error);
        this.showError("Failed to generate META.js");
        this.setButtonsState(false);
      }
    }
  }

  /**
   * Generate META.js output from services
   * @param {Array<string>} services - Selected services
   * @returns {Promise<string>} Generated META.js code
   */
  async generateOutput(services) {
    if (!this.templateCache) {
      throw new Error("Template not loaded");
    }

    if (services.length === 0) {
      return this.templateCache.replace("/* SERVICES_PLACEHOLDER */", "");
    }

    const configs = await this.serviceConfigGenerator.generateServiceConfigs(
      services
    );
    const servicesString = this.serviceConfigGenerator.configsToString(configs);

    return this.templateCache.replace(
      "/* SERVICES_PLACEHOLDER */",
      servicesString
    );
  }

  /**
   * Update output display
   * @param {string} output - Generated output
   */
  updateOutput(output) {
    // Find or create output display element
    let outputDisplay =
      this.elements.outputContainer.querySelector(".output-display");

    if (!outputDisplay) {
      outputDisplay = document.createElement("div");
      outputDisplay.className = "output-display";
      this.elements.outputContainer
        .querySelector(".card-content")
        .appendChild(outputDisplay);
    }

    // Store the output for copy/download functionality without displaying it
    this.currentOutput = output;

    if (output.trim()) {
      outputDisplay.innerHTML = `
        <div class="no-output">
          <i class="fas fa-check-circle"></i>
          <h3>META.js Generated Successfully</h3>
          <p>Use the buttons above to copy or download your META.js</p>
        </div>
      `;
    } else {
      outputDisplay.innerHTML = `
        <div class="no-output">
          <i class="fas fa-code"></i>
          <h3>No configuration generated</h3>
          <p>Select services to generate your META.js</p>
        </div>
      `;
    }
  }

  /**
   * Escape HTML for safe display
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Set buttons enabled/disabled state
   * @param {boolean} enabled - Whether buttons should be enabled
   * @param {string} [loadingText] - Optional loading text
   */
  setButtonsState(enabled, loadingText = null) {
    const buttons = [this.elements.copyButton, this.elements.downloadButton];

    buttons.forEach((button) => {
      button.disabled = !enabled;

      if (loadingText && !enabled) {
        const originalContent =
          button.dataset.originalContent || button.innerHTML;
        button.dataset.originalContent = originalContent;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
      } else if (button.dataset.originalContent) {
        button.innerHTML = button.dataset.originalContent;
        delete button.dataset.originalContent;
      }
    });
  }

  /**
   * Copy generated output to clipboard
   */
  async copyToClipboard() {
    try {
      if (!this.currentOutput || !this.currentOutput.trim()) {
        throw new Error("No output to copy");
      }

      await navigator.clipboard.writeText(this.currentOutput);
      this.showCopySuccess();
    } catch (error) {
      console.error("Copy failed:", error);
      this.showCopyError();
    }
  }

  /**
   * Show copy success feedback
   */
  showCopySuccess() {
    const originalContent = this.elements.copyButton.innerHTML;
    this.elements.copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
    this.elements.copyButton.classList.add("btn-success");

    setTimeout(() => {
      this.elements.copyButton.innerHTML = originalContent;
      this.elements.copyButton.classList.remove("btn-success");
    }, 2000);
  }

  /**
   * Show copy error feedback
   */
  showCopyError() {
    const originalContent = this.elements.copyButton.innerHTML;
    this.elements.copyButton.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Copy Failed';
    this.elements.copyButton.classList.add("btn-danger");

    setTimeout(() => {
      this.elements.copyButton.innerHTML = originalContent;
      this.elements.copyButton.classList.remove("btn-danger");
    }, 2000);
  }

  /**
   * Download generated output as file
   */
  async downloadFile() {
    try {
      if (!this.currentOutput || !this.currentOutput.trim()) {
        throw new Error("No output to download");
      }

      const blob = new Blob([this.currentOutput], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "META.js";
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      this.showDownloadSuccess();
    } catch (error) {
      console.error("Download failed:", error);
      this.showDownloadError();
    }
  }

  /**
   * Show download success feedback
   */
  showDownloadSuccess() {
    const originalContent = this.elements.downloadButton.innerHTML;
    this.elements.downloadButton.innerHTML =
      '<i class="fas fa-check"></i> Downloaded!';
    this.elements.downloadButton.classList.add("btn-success");

    setTimeout(() => {
      this.elements.downloadButton.innerHTML = originalContent;
      this.elements.downloadButton.classList.remove("btn-success");
    }, 1500);
  }

  /**
   * Show download error feedback
   */
  showDownloadError() {
    const originalContent = this.elements.downloadButton.innerHTML;
    this.elements.downloadButton.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Download Failed';
    this.elements.downloadButton.classList.add("btn-danger");

    setTimeout(() => {
      this.elements.downloadButton.innerHTML = originalContent;
      this.elements.downloadButton.classList.remove("btn-danger");
    }, 2000);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const outputDisplay =
      this.elements.outputContainer.querySelector(".output-display") ||
      document.createElement("div");

    outputDisplay.className = "output-display";
    outputDisplay.innerHTML = `
      <div class="output-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `;

    if (!outputDisplay.parentNode) {
      this.elements.outputContainer
        .querySelector(".card-content")
        .appendChild(outputDisplay);
    }
  }
}
