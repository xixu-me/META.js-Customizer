/**
 * Domain Preview Manager Com    this.elements = {
      modal: document.getElementById("domain-preview-modal"),
      modalTitle: document.getElementById("modal-title"),
      modalServiceName: document.getElementById("modal-service-name"),
      modalDescription: document.getElementById("modal-description"),
      modalLoading: document.getElementById("modal-loading"),
      domainsList: document.getElementById("domains-list"),
      modalError: document.getElementById("modal-error"),
      errorMessage: document.getElementById("error-message"),
      modalClose: document.querySelector(".modal-close")
    };Handles domain preview functionality including:
 * - Fetching YAML files from GitHub repository
 * - Parsing payload arrays from YAML content
 * - Displaying domain lists in modal popup
 * - Organizing domains by type (DOMAIN, DOMAIN-SUFFIX, DOMAIN-KEYWORD)
 *
 * @author xixu-me
 * @license GPL-3.0
 */

export class DomainPreviewManager {
  constructor() {
    this.owner = "xixu-me";
    this.repo = "RFM";
    this.branch = "universal";
    this.baseUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/yaml`;

    // Wait for DOM to be ready before initializing elements
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeElements()
      );
    } else {
      this.initializeElements();
    }
  }

  /**
   * Initialize DOM elements after DOM is ready
   */
  initializeElements() {
    this.elements = {
      modal: document.getElementById("domain-preview-modal"),
      modalTitle: document.getElementById("modal-title"),
      modalServiceName: document.getElementById("modal-service-name"),
      modalDescription: document.getElementById("modal-description"),
      modalLoading: document.getElementById("modal-loading"),
      domainStats: document.getElementById("domain-stats"),
      domainsList: document.getElementById("domains-list"),
      modalError: document.getElementById("modal-error"),
      errorMessage: document.getElementById("error-message"),
      totalDomains: document.getElementById("total-domains"),
      domainSuffixes: document.getElementById("domain-suffixes"),
      keywords: document.getElementById("keywords"),
      modalClose: document.querySelector(".modal-close"),
    };

    this.init();
  }

  /**
   * Initialize the domain preview manager
   */
  init() {
    if (!this.elements.modal) {
      console.error("Domain preview modal not found in DOM");
      return;
    }

    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close modal events
    this.elements.modalClose.addEventListener("click", () => this.closeModal());
    this.elements.modal.addEventListener("click", (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });

    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isModalOpen()) {
        this.closeModal();
      }
    });

    // Listen for preview requests
    document.addEventListener("domainPreviewRequest", (event) => {
      this.showPreview(event.detail.serviceName);
    });
  }

  /**
   * Show domain preview for a service
   * @param {string} serviceName - Name of the service
   */
  async showPreview(serviceName) {
    this.openModal();
    this.showLoading(serviceName);

    try {
      const domainData = await this.fetchDomainData(serviceName);
      this.displayDomainData(serviceName, domainData);
    } catch (error) {
      console.error("Failed to load domain data:", error);
      this.showError("Failed to load domain information for this service.");
    }
  }

  /**
   * Fetch domain data from YAML file
   * @param {string} serviceName - Name of the service
   * @returns {Promise<Object>} Parsed domain data
   */
  async fetchDomainData(serviceName) {
    const yamlUrl = `${this.baseUrl}/${serviceName}.yaml`;

    try {
      const response = await fetch(yamlUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const yamlText = await response.text();
      return this.parseYamlDomains(yamlText);
    } catch (error) {
      throw new Error(`Unable to fetch domain data: ${error.message}`);
    }
  }

  /**
   * Parse YAML content to extract domain information
   * @param {string} yamlText - Raw YAML content
   * @returns {Object} Parsed domain data organized by type
   */
  parseYamlDomains(yamlText) {
    const domainData = {
      domains: [],
      domainSuffixes: [],
      keywords: [],
      total: 0,
    };

    try {
      // Simple YAML parsing focused on payload section
      const lines = yamlText.split("\n");
      let inPayloadSection = false;
      let currentIndentation = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Skip comments and empty lines
        if (!trimmedLine || trimmedLine.startsWith("#")) {
          continue;
        }

        // Check if we're entering the payload section
        if (trimmedLine === "payload:" || trimmedLine.startsWith("payload:")) {
          inPayloadSection = true;
          currentIndentation = line.indexOf(trimmedLine.split(":")[0]);
          continue;
        }

        // If we're in payload section, look for list items
        if (inPayloadSection) {
          // Check for array items (lines starting with - after spaces)
          const match = line.match(/^(\s*)-\s*(.+)$/);
          if (match) {
            const domain = match[2].trim();

            // Remove quotes if present
            const cleanDomain = domain.replace(/^["']|["']$/g, "");

            if (cleanDomain) {
              // Determine domain type based on prefix or content
              if (cleanDomain.startsWith("+.")) {
                // Domain suffix (e.g., "+.example.com")
                domainData.domainSuffixes.push(cleanDomain);
              } else if (
                cleanDomain.includes("KEYWORD") ||
                cleanDomain.toLowerCase().includes("keyword") ||
                cleanDomain.includes("*")
              ) {
                // Keywords or wildcard patterns
                domainData.keywords.push(cleanDomain);
              } else {
                // Regular domain
                domainData.domains.push(cleanDomain);
              }
            }
          }
          // Check if we've exited the payload section
          else if (
            trimmedLine &&
            !trimmedLine.startsWith("-") &&
            line.search(/\S/) <= currentIndentation &&
            trimmedLine !== "payload:"
          ) {
            inPayloadSection = false;
          }
        }
      }

      domainData.total =
        domainData.domains.length +
        domainData.domainSuffixes.length +
        domainData.keywords.length;

      // If no domains found, try a more aggressive approach
      if (domainData.total === 0) {
        this.parseYamlFallback(yamlText, domainData);
      }
    } catch (error) {
      console.error("Error parsing YAML:", error);
      // Try fallback parsing method
      this.parseYamlFallback(yamlText, domainData);
    }

    return domainData;
  }

  /**
   * Fallback YAML parsing method for different structures
   * @param {string} yamlText - Raw YAML content
   * @param {Object} domainData - Domain data object to populate
   */
  parseYamlFallback(yamlText, domainData) {
    try {
      // Look for any line that looks like a domain
      const lines = yamlText.split("\n");
      const domainRegex =
        /^[\s\-]*(?:["'])?([a-zA-Z0-9\-\+\.]+\.[a-zA-Z]{2,}|[\w\-\+\.]+\*[\w\-\.]*|\+\.[\w\-\.]+)(?:["'])?[\s]*$/;

      for (const line of lines) {
        const match = line.match(domainRegex);
        if (match) {
          const domain = match[1].trim();

          if (domain.startsWith("+.")) {
            domainData.domainSuffixes.push(domain);
          } else if (domain.includes("*") || domain.includes("KEYWORD")) {
            domainData.keywords.push(domain);
          } else {
            domainData.domains.push(domain);
          }
        }
      }

      domainData.total =
        domainData.domains.length +
        domainData.domainSuffixes.length +
        domainData.keywords.length;
    } catch (error) {
      console.error("Fallback YAML parsing failed:", error);
    }
  }

  /**
   * Display domain data in the modal
   * @param {string} serviceName - Name of the service
   * @param {Object} domainData - Parsed domain data
   */
  displayDomainData(serviceName, domainData) {
    // Update service info
    this.elements.modalServiceName.textContent = serviceName;
    this.elements.modalDescription.textContent = `Domain rules and patterns for ${serviceName} service`;

    // Build domains list HTML
    let domainsHTML = "";

    // Regular domains
    if (domainData.domains.length > 0) {
      domainsHTML += this.createDomainCategory(
        "Exact Domains",
        "fas fa-globe",
        domainData.domains,
        "Exact domain matches"
      );
    }

    // Domain suffixes
    if (domainData.domainSuffixes.length > 0) {
      domainsHTML += this.createDomainCategory(
        "Domain Suffixes",
        "fas fa-sitemap",
        domainData.domainSuffixes,
        "Matches domain and all subdomains"
      );
    }

    // Keywords
    if (domainData.keywords.length > 0) {
      domainsHTML += this.createDomainCategory(
        "Pattern Rules",
        "fas fa-key",
        domainData.keywords,
        "Keyword-based and wildcard matching rules"
      );
    }

    if (domainsHTML === "") {
      domainsHTML =
        '<div class="no-domains"><i class="fas fa-inbox"></i><p>No domain rules found</p></div>';
    }

    this.elements.domainsList.innerHTML = domainsHTML;

    // Show content and hide loading
    this.hideLoading();
    this.elements.domainsList.style.display = "block";

    // Add click handlers for category toggles
    this.setupCategoryToggles();
  }

  /**
   * Create HTML for a domain category
   * @param {string} title - Category title
   * @param {string} icon - Font Awesome icon class
   * @param {Array} domains - Array of domains
   * @param {string} description - Category description
   * @returns {string} HTML string
   */
  createDomainCategory(title, icon, domains, description) {
    const domainItems = domains
      .map(
        (domain) =>
          `<div class="domain-item" title="${description}">${domain}</div>`
      )
      .join("");

    return `
      <div class="domain-category">
        <div class="category-header" data-category="${title.toLowerCase()}">
          <div class="category-title">
            <i class="${icon}"></i>
            <span>${title}</span>
          </div>
          <div class="category-count">${domains.length}</div>
          <i class="fas fa-chevron-down category-toggle"></i>
        </div>
        <div class="domain-items">
          ${domainItems}
        </div>
      </div>
    `;
  }

  /**
   * Set up category toggle functionality
   */
  setupCategoryToggles() {
    const categoryHeaders =
      this.elements.domainsList.querySelectorAll(".category-header");

    categoryHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        header.classList.toggle("collapsed");
      });
    });
  }

  /**
   * Show loading state
   * @param {string} serviceName - Name of the service
   */
  showLoading(serviceName) {
    this.elements.modalServiceName.textContent = serviceName;
    this.elements.modalDescription.textContent =
      "Loading domain information...";

    this.elements.modalLoading.style.display = "block";
    this.elements.domainsList.style.display = "none";
    this.elements.modalError.style.display = "none";
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.elements.modalLoading.style.display = "none";
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    this.hideLoading();
    this.elements.domainsList.style.display = "none";

    this.elements.errorMessage.textContent = message;
    this.elements.modalError.style.display = "block";
  }

  /**
   * Open the modal
   */
  openModal() {
    this.elements.modal.classList.add("show");
    this.elements.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus the close button for accessibility
    setTimeout(() => {
      this.elements.modalClose.focus();
    }, 100);
  }

  /**
   * Close the modal
   */
  closeModal() {
    this.elements.modal.classList.remove("show");
    this.elements.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /**
   * Check if modal is currently open
   * @returns {boolean} True if modal is open
   */
  isModalOpen() {
    return this.elements.modal.classList.contains("show");
  }

  /**
   * Trigger domain preview for a service
   * @param {string} serviceName - Name of the service
   */
  static requestPreview(serviceName) {
    const event = new CustomEvent("domainPreviewRequest", {
      detail: { serviceName },
    });
    document.dispatchEvent(event);
  }
}
