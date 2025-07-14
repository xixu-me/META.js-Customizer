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
 * @version 2.0.0
 */

export class ServicesManager {
  constructor() {
    this.owner = "xixu-me";
    this.repo = "RFM";
    this.branch = "universal";
    this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${this.branch}?recursive=1`;

    this.allServices = [];
    this.selectedServices = new Set();
    this.selectedServicesOrder = []; // Track order for drag functionality
    this.searchTimeout = null;

    // Drag state
    this.dragState = {
      isDragging: false,
      draggedElement: null,
      draggedIndex: -1,
      placeholder: null,
      initialMouseY: 0,
      initialElementY: 0,
      mouseOffset: 0,
    };

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

    // Handle drag events
    this.setupDragListeners();
  }

  /**
   * Set up drag and drop event listeners
   */
  setupDragListeners() {
    this.elements.selectedServices.addEventListener("mousedown", (e) => {
      this.handleDragStart(e);
    });

    document.addEventListener("mousemove", (e) => {
      this.handleDragMove(e);
    });

    document.addEventListener("mouseup", (e) => {
      this.handleDragEnd(e);
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
      return;
    }

    // Use ordered array instead of sorted Set
    this.elements.selectedServices.innerHTML = this.selectedServicesOrder
      .map(
        (serviceName, index) => `
        <div class="selected-service-item" data-index="${index}">
          <div class="service-info">
            <i class="fas fa-grip-lines service-drag-handle" title="Drag to reorder"></i>
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
   * Handle drag start
   * @param {MouseEvent} event - Mouse event
   */
  handleDragStart(event) {
    const dragHandle = event.target.closest(".service-drag-handle");
    if (!dragHandle) return;

    event.preventDefault();

    const serviceItem = dragHandle.closest(".selected-service-item");
    if (!serviceItem) return;

    this.dragState.isDragging = true;
    this.dragState.draggedElement = serviceItem;
    this.dragState.draggedIndex = parseInt(serviceItem.dataset.index);

    // Store initial positions for mouse following
    const rect = serviceItem.getBoundingClientRect();
    this.dragState.initialMouseY = event.clientY;
    this.dragState.initialElementY = rect.top;
    this.dragState.mouseOffset = event.clientY - rect.top;

    // Create placeholder with smooth appearance
    this.dragState.placeholder = document.createElement("div");
    this.dragState.placeholder.className =
      "selected-service-item drag-placeholder";
    this.dragState.placeholder.innerHTML = `
      <div class="service-info">
        <i class="fas fa-grip-lines service-drag-handle"></i>
        <span class="service-name"></span>
      </div>
    `;

    // Add dragging classes with smooth animation
    serviceItem.classList.add("dragging");
    document.body.classList.add("dragging");

    // Insert placeholder with animation
    this.dragState.placeholder.style.height = "0px";
    this.dragState.placeholder.style.opacity = "0";
    this.dragState.placeholder.style.marginBottom = "0px";
    serviceItem.parentNode.insertBefore(
      this.dragState.placeholder,
      serviceItem.nextSibling
    );

    // Animate placeholder appearance
    requestAnimationFrame(() => {
      this.dragState.placeholder.style.height = serviceItem.offsetHeight + "px";
      this.dragState.placeholder.style.opacity = "1";
      this.dragState.placeholder.style.marginBottom = "0.75rem";
    });
  }

  /**
   * Handle drag move
   * @param {MouseEvent} event - Mouse event
   */
  handleDragMove(event) {
    if (!this.dragState.isDragging) return;

    // Make dragged element follow mouse vertically
    const draggedElement = this.dragState.draggedElement;
    if (draggedElement) {
      const deltaY = event.clientY - this.dragState.initialMouseY;
      draggedElement.style.transform = `translateY(${deltaY}px) scale(1.05)`;
      draggedElement.style.zIndex = "1000";
      draggedElement.style.position = "relative";
    }

    const serviceItems = Array.from(
      this.elements.selectedServices.querySelectorAll(
        ".selected-service-item:not(.dragging):not(.drag-placeholder)"
      )
    );

    let targetIndex = serviceItems.length; // Default to end
    let closestItem = null;
    let closestDistance = Infinity;

    // Find the closest item for smoother animation
    for (let i = 0; i < serviceItems.length; i++) {
      const item = serviceItems[i];
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(event.clientY - itemCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }

      if (event.clientY < itemCenter) {
        targetIndex = i;
        break;
      }
    }

    // Add smooth animation classes to other items
    serviceItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;

      if (event.clientY < itemCenter && index >= targetIndex) {
        item.style.transform = "translateY(8px)";
      } else if (event.clientY > itemCenter && index < targetIndex) {
        item.style.transform = "translateY(-8px)";
      } else {
        item.style.transform = "translateY(0)";
      }
    });

    // Move placeholder to new position with smooth transition
    const targetItem = serviceItems[targetIndex];
    if (targetItem) {
      targetItem.parentNode.insertBefore(
        this.dragState.placeholder,
        targetItem
      );
    } else {
      // Insert at end
      this.elements.selectedServices.appendChild(this.dragState.placeholder);
    }
  }

  /**
   * Handle drag end
   * @param {MouseEvent} event - Mouse event
   */
  handleDragEnd(event) {
    if (!this.dragState.isDragging) return;

    // Reset transforms on all items with smooth animation
    const allServiceItems = Array.from(
      this.elements.selectedServices.querySelectorAll(
        ".selected-service-item:not(.dragging):not(.drag-placeholder)"
      )
    );

    allServiceItems.forEach((item) => {
      item.style.transform = "";
      item.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    });

    // Calculate new index based on placeholder position
    const allItems = Array.from(
      this.elements.selectedServices.querySelectorAll(
        ".selected-service-item, .drag-placeholder"
      )
    );
    const placeholderIndex = allItems.indexOf(this.dragState.placeholder);
    const newIndex =
      placeholderIndex > this.dragState.draggedIndex
        ? placeholderIndex - 1
        : placeholderIndex;

    // Update services order
    this.reorderServices(this.dragState.draggedIndex, newIndex);

    // Animate placeholder disappearance
    if (this.dragState.placeholder && this.dragState.placeholder.parentNode) {
      this.dragState.placeholder.style.height = "0px";
      this.dragState.placeholder.style.opacity = "0";
      this.dragState.placeholder.style.marginBottom = "0px";

      setTimeout(() => {
        if (
          this.dragState.placeholder &&
          this.dragState.placeholder.parentNode
        ) {
          this.dragState.placeholder.parentNode.removeChild(
            this.dragState.placeholder
          );
        }
      }, 300);
    }

    // Clean up with smooth animation
    this.dragState.draggedElement.classList.remove("dragging");
    this.dragState.draggedElement.style.transform = "";
    this.dragState.draggedElement.style.zIndex = "";
    this.dragState.draggedElement.style.position = "";
    document.body.classList.remove("dragging");

    // Reset drag state
    this.dragState = {
      isDragging: false,
      draggedElement: null,
      draggedIndex: -1,
      placeholder: null,
      initialMouseY: 0,
      initialElementY: 0,
      mouseOffset: 0,
    };

    // Update UI and trigger change event with smooth animation
    setTimeout(() => {
      this.renderSelectedServices();
      this.triggerSelectionChange();
    }, 50);
  }

  /**
   * Reorder services array
   * @param {number} fromIndex - Original index
   * @param {number} toIndex - Target index
   */
  reorderServices(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const item = this.selectedServicesOrder[fromIndex];
    this.selectedServicesOrder.splice(fromIndex, 1);
    this.selectedServicesOrder.splice(toIndex, 0, item);
  }
}
