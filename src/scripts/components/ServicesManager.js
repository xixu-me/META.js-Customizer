/**
 * Services Manager Component
 *
 * Handles service data management including:
 * - Retrieval from RFM repository via GitHub API
 * - Real-time filtering and searching
 * - Selected services management with persistence
 * - Debounced search optimization
 *
 * @author xixu-me
 * @license GPL-3.0
 */

export class ServicesManager {
  constructor() {
    this.owner = "xixu-me";
    this.repo = "RFM";
    this.branch = "universal";
    this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${this.branch}?recursive=1`;

    this.allServices = [];
    this.selectedServices = new Set();
    this.selectedServicesOrder = [];
    this.searchTimeout = null;
    this.sortable = null; // SortableJS instance

    this.elements = {
      searchInput: document.getElementById("search-input"),
      searchResults: document.getElementById("search-results"),
      selectedServices: document.getElementById("selected-services"),
      selectedCount: document.getElementById("selected-count"),
    };

    this.init();
  }

  /**
   * Initialize services manager
   */
  async init() {
    this.setupEventListeners();
    await this.fetchServices();
    this.updateUI();
  }

  /**
   * Fetch available services from GitHub API
   * @returns {Promise<void>}
   */
  async fetchServices() {
    try {
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch services: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const mrsFiles = data.tree.filter(
        (file) => file.path.endsWith(".mrs") && file.type === "blob"
      );

      this.allServices = mrsFiles.map((file) => ({
        name: file.path.replace(".mrs", ""),
        path: file.path,
        url: file.url,
      }));

      this.allServices.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error fetching services:", error);
      this.showError(`Error loading services: ${error.message}`);
    }
  }

  /**
   * Show error message in search results
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.elements.searchResults.innerHTML = `
      <div class="search-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Debounced search input
    this.elements.searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 300);
    });

    // Hide search results on blur with delay for clicks
    this.elements.searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        this.hideSearchResults();
      }, 200);
    });

    // Handle search result clicks
    this.elements.searchResults.addEventListener("click", (e) => {
      this.handleSearchResultClick(e);
    });

    // Handle selected service removal
    this.elements.selectedServices.addEventListener("click", (e) => {
      this.handleSelectedServiceClick(e);
    });
  }

  /**
   * Handle search input with debouncing
   * @param {string} searchTerm - Search term
   */
  handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
      this.hideSearchResults();
      return;
    }

    const filteredServices = this.allServices.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !this.selectedServices.has(service.name)
    );

    this.showSearchResults(filteredServices);
  }

  /**
   * Show search results dropdown
   * @param {Array} services - Filtered services array
   */
  showSearchResults(services) {
    if (services.length === 0) {
      this.elements.searchResults.innerHTML = `
        <div class="search-result-item search-no-results">
          <i class="fas fa-search"></i>
          No matching services found
        </div>
      `;
    } else {
      this.elements.searchResults.innerHTML = services
        .slice(0, 10) // Limit to 10 results for performance
        .map(
          (service) => `
          <div class="search-result-item" data-service-name="${service.name}">
            <i class="fas fa-plus-circle"></i>
            <span>${service.name}</span>
          </div>
        `
        )
        .join("");
    }

    this.elements.searchResults.classList.add("show");
  }

  /**
   * Hide search results dropdown
   */
  hideSearchResults() {
    this.elements.searchResults.classList.remove("show");
  }

  /**
   * Handle clicks on search results
   * @param {Event} event - Click event
   */
  handleSearchResultClick(event) {
    const resultItem = event.target.closest(".search-result-item");
    if (!resultItem || resultItem.classList.contains("search-no-results"))
      return;

    const serviceName = resultItem.dataset.serviceName;
    if (serviceName) {
      this.addService(serviceName);
    }
  }

  /**
   * Handle clicks on selected services (removal)
   * @param {Event} event - Click event
   */
  handleSelectedServiceClick(event) {
    if (event.target.classList.contains("service-remove-btn")) {
      const serviceName = event.target.dataset.serviceName;
      if (serviceName) {
        this.removeService(serviceName);
      }
    }
  }

  /**
   * Add service to selection
   * @param {string} serviceName - Service name to add
   */
  addService(serviceName) {
    if (!this.selectedServices.has(serviceName)) {
      this.selectedServices.add(serviceName);
      this.selectedServicesOrder.push(serviceName);
      this.updateUI();
      this.clearSearch();
      this.triggerSelectionChange();
    }
  }

  /**
   * Remove service from selection
   * @param {string} serviceName - Service name to remove
   */
  removeService(serviceName) {
    if (this.selectedServices.has(serviceName)) {
      this.selectedServices.delete(serviceName);
      const index = this.selectedServicesOrder.indexOf(serviceName);
      if (index > -1) {
        this.selectedServicesOrder.splice(index, 1);
      }
      this.updateUI();
      this.triggerSelectionChange();
    }
  }

  /**
   * Clear search input and hide results
   */
  clearSearch() {
    this.elements.searchInput.value = "";
    this.hideSearchResults();
  }

  /**
   * Update UI components
   */
  updateUI() {
    this.updateSelectedCount();
    this.renderSelectedServices();
  }

  /**
   * Update selected services count display
   */
  updateSelectedCount() {
    const selectedCount = this.selectedServices.size;
    const totalCount = this.allServices.length;
    this.elements.selectedCount.textContent = `${selectedCount} of ${totalCount} selected`;
  }

  /**
   * Render selected services list
   */
  renderSelectedServices() {
    if (this.selectedServices.size === 0) {
      this.elements.selectedServices.innerHTML = `
        <div class="no-services">
          <i class="fas fa-inbox"></i>
          <h3>No services selected</h3>
          <p>Search for services above to get started</p>
        </div>
      `;
      this.destroySortable();
      return;
    }

    // Use ordered array instead of sorted Set
    this.elements.selectedServices.innerHTML = this.selectedServicesOrder
      .map(
        (serviceName, index) => `
        <div class="selected-service-item" data-index="${index}" data-service-name="${serviceName}">
          <div class="drag-handle" title="Drag to reorder">
            <i class="fas fa-grip-vertical"></i>
          </div>
          <div class="service-info">
            <span class="service-name">${serviceName}</span>
          </div>
          <button class="service-remove-btn" 
                  data-service-name="${serviceName}"
                  title="Remove ${serviceName}"
                  aria-label="Remove ${serviceName}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `
      )
      .join("");

    // Initialize or reinitialize sortable
    this.initializeSortable();
  }

  /**
   * Initialize SortableJS for drag-and-drop reordering
   */
  initializeSortable() {
    // Destroy existing sortable instance if it exists
    this.destroySortable();

    // Only initialize if we have selected services
    if (this.selectedServices.size === 0) {
      return;
    }

    // Initialize SortableJS
    this.sortable = new Sortable(this.elements.selectedServices, {
      animation: 200, // Animation speed in ms
      ghostClass: "sortable-ghost", // Class for the drop placeholder
      dragClass: "sortable-drag", // Class for the item being dragged
      chosenClass: "sortable-chosen", // Class for the chosen item
      handle: ".drag-handle", // Only allow dragging by the handle
      forceFallback: true, // Force HTML5 DnD fallback for better cross-browser support
      fallbackClass: "sortable-fallback", // Class for fallback
      onStart: (evt) => {
        // Add dragging state to container
        this.elements.selectedServices.classList.add("is-dragging");
      },
      onEnd: (evt) => {
        // Remove dragging state from container
        this.elements.selectedServices.classList.remove("is-dragging");

        // Update the order if the position changed
        if (evt.oldIndex !== evt.newIndex) {
          this.updateServiceOrder(evt.oldIndex, evt.newIndex);
        }
      },
    });
  }

  /**
   * Destroy the current SortableJS instance
   */
  destroySortable() {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }
  }

  /**
   * Update service order after drag and drop
   * @param {number} oldIndex - Previous index
   * @param {number} newIndex - New index
   */
  updateServiceOrder(oldIndex, newIndex) {
    // Move the item in the order array
    const movedService = this.selectedServicesOrder.splice(oldIndex, 1)[0];
    this.selectedServicesOrder.splice(newIndex, 0, movedService);

    // Trigger selection change event for other components
    this.triggerSelectionChange();

    console.log(
      `Moved service "${movedService}" from position ${oldIndex} to ${newIndex}`
    );
  }

  /**
   * Get selected services as array (ordered)
   * @returns {Array<string>} Array of selected service names
   */
  getSelectedServices() {
    return [...this.selectedServicesOrder];
  }

  /**
   * Trigger selection change event for other components
   */
  triggerSelectionChange() {
    const event = new CustomEvent("servicesChanged", {
      detail: { services: this.getSelectedServices() },
    });
    document.dispatchEvent(event);
  }

  /**
   * Check if services are loaded
   * @returns {boolean} True if services are loaded
   */
  isLoaded() {
    return this.allServices.length > 0;
  }

  /**
   * Destroy the services manager and cleanup
   */
  destroy() {
    // Clear search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    // Destroy sortable instance
    this.destroySortable();

    // Clear data
    this.allServices = [];
    this.selectedServices.clear();
    this.selectedServicesOrder = [];
  }
}
