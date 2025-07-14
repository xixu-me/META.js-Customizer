document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const selectedServices = document.getElementById("selected-services");
  const selectedCountEl = document.getElementById("selected-count");
  const copyButton = document.getElementById("copyButton");
  const downloadButton = document.getElementById("downloadButton");
  const themeToggle = document.getElementById("theme-toggle");

  const owner = "xixu-me";
  const repo = "RFM";
  const branch = "universal";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  let allServices = [];
  let selectedServicesList = [];

  // Theme management
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = getSystemTheme();
    const initialTheme = savedTheme || systemTheme;

    document.documentElement.setAttribute("data-theme", initialTheme);
    updateThemeIcon(initialTheme);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
          const newSystemTheme = e.matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", newSystemTheme);
          updateThemeIcon(newSystemTheme);
        }
      });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    const isSystemDefault = !localStorage.getItem("theme");

    if (isSystemDefault) {
      // Show auto icon when following system
      icon.className = "fas fa-circle-half-stroke";
      themeToggle.title = "Theme: Auto (following system)";
    } else if (theme === "dark") {
      icon.className = "fas fa-sun";
      themeToggle.title = "Switch to light mode";
    } else {
      icon.className = "fas fa-moon";
      themeToggle.title = "Switch to dark mode";
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme) {
      // First click: set to opposite of current system theme
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme);
    } else {
      // Subsequent clicks: cycle through light -> dark -> auto
      if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        updateThemeIcon("dark");
      } else if (savedTheme === "dark") {
        // Reset to auto (system preference)
        localStorage.removeItem("theme");
        const systemTheme = getSystemTheme();
        document.documentElement.setAttribute("data-theme", systemTheme);
        updateThemeIcon(systemTheme);
      }
    }
  }

  async function fetchServices() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const data = await response.json();
      const mrsFiles = data.tree.filter(
        (file) => file.path.endsWith(".mrs") && file.type === "blob"
      );

      allServices = mrsFiles.map((file) => {
        const name = file.path.replace(".mrs", "");
        const formattedName = name;

        const serviceDefinition = {
          name: formattedName,
        };

        // Improved heuristics for tld, sld, alias, domain based on favicon availability and service patterns
        if (name.includes("google-")) {
          // Google services: use google TLD for favicon consistency
          serviceDefinition.tld = "google";
          serviceDefinition.alias = formattedName;
        } else if (name === "xai") {
          // xAI: specific case with SLD needed for proper favicon
          serviceDefinition.name = "xAI";
          serviceDefinition.tld = "ai";
          serviceDefinition.sld = "x";
        } else if (name === "rednote") {
          // RedNote: use domain for services with non-standard favicon requirements
          serviceDefinition.name = "rednote";
          serviceDefinition.domain = "xiaohongshu.com";
          serviceDefinition.alias = "Xiaohongshu";
        } else if (name === "claude-ai") {
          // Claude: use domain for Anthropic's service
          serviceDefinition.domain = "claude.ai";
        } else if (name === "openai") {
          // OpenAI: simple case where service name matches SLD
          serviceDefinition.tld = "com";
        } else if (name === "github") {
          // GitHub: simple case where service name matches SLD
          serviceDefinition.tld = "com";
        } else if (name.includes("-")) {
          // Services with hyphens: check if last part is a known TLD
          const parts = name.split("-");
          const lastPart = parts[parts.length - 1];

          if (["com", "org", "net", "ai", "io", "co"].includes(lastPart)) {
            // If ends with known TLD, use it and add SLD if needed
            serviceDefinition.tld = lastPart;
            if (parts.length > 1) {
              const remainingParts = parts.slice(0, -1);
              if (remainingParts.length === 1) {
                // Single part before TLD becomes SLD
                serviceDefinition.sld = remainingParts[0];
              } else {
                // Multiple parts: join as SLD or use domain for complex cases
                const potentialSld = remainingParts.join("-");
                if (potentialSld.length <= 15) {
                  serviceDefinition.sld = potentialSld;
                } else {
                  // For very long or complex names, prefer domain
                  serviceDefinition.domain = `${name.replace("-", ".")}.com`;
                }
              }
            }
          } else {
            // No clear TLD pattern: check if it's a compound service name
            if (
              parts.length === 2 &&
              parts[0].length <= 10 &&
              parts[1].length <= 10
            ) {
              // Two reasonable parts: treat as SLD-TLD or use SLD with common TLD
              serviceDefinition.tld = "com";
              serviceDefinition.sld = parts[0];
            } else {
              // Complex name: use domain to ensure favicon availability
              serviceDefinition.domain = `${name.replace(/-/g, "")}.com`;
            }
          }
        } else {
          // Single word services: default to com TLD
          serviceDefinition.tld = "com";
        }

        return serviceDefinition;
      });

      updateSelectedCount();
    } catch (error) {
      searchResults.innerHTML = `<p style="padding: 1rem;">Error loading services: ${error.message}</p>`;
      console.error(error);
    }
  }

  function showSearchResults(searchTerm) {
    if (!searchTerm.trim()) {
      searchResults.classList.remove("show");
      return;
    }

    const filteredServices = allServices.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedServicesList.find((selected) => selected.name === service.name)
    );

    if (filteredServices.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">No matching services found</div>';
    } else {
      searchResults.innerHTML = filteredServices
        .map(
          (service) => `
          <div class="search-result-item" data-service='${JSON.stringify(
            service
          )}'>
            ${service.name}
          </div>
        `
        )
        .join("");
    }

    searchResults.classList.add("show");
  }

  function addService(service) {
    if (
      !selectedServicesList.find((selected) => selected.name === service.name)
    ) {
      selectedServicesList.push(service);
      renderSelectedServices();
      updateSelectedCount();
      searchInput.value = "";
      searchResults.classList.remove("show");
    }
  }

  function removeService(serviceName) {
    selectedServicesList = selectedServicesList.filter(
      (service) => service.name !== serviceName
    );
    renderSelectedServices();
    updateSelectedCount();
  }

  function renderSelectedServices() {
    if (selectedServicesList.length === 0) {
      selectedServices.innerHTML = `
        <div class="no-services">
          <i class="fas fa-inbox"></i>
          <p>No services selected</p>
          <small>Search for services above to get started</small>
        </div>
      `;
      return;
    }

    selectedServices.innerHTML = selectedServicesList
      .map(
        (service) => `
        <div class="selected-service-item">
          <span class="service-name">${service.name}</span>
          <button class="delete-button" data-service="${service.name}">
            <i class="fas fa-times"></i> Remove
          </button>
        </div>
      `
      )
      .join("");
  }

  function updateSelectedCount() {
    const selectedCount = selectedServicesList.length;
    const totalCount = allServices.length;
    selectedCountEl.textContent = `${selectedCount} of ${totalCount} selected`;
  }

  function generateServicesString(services) {
    return services
      .map((s) => {
        let definition = `{ name: "${s.name}"`;
        if (s.tld) definition += `, tld: "${s.tld}"`;
        if (s.sld) definition += `, sld: "${s.sld}"`;
        if (s.domain) definition += `, domain: "${s.domain}"`;
        if (s.alias) definition += `, alias: "${s.alias}"`;
        definition += ` }`;
        return definition;
      })
      .join(",\n  ");
  }

  function generateOutput() {
    const servicesString = generateServicesString(selectedServicesList);
    return metaTemplate.replace("/* SERVICES_PLACEHOLDER */", servicesString);
  }

  // Event listeners
  searchInput.addEventListener("input", (e) => {
    showSearchResults(e.target.value);
  });

  searchInput.addEventListener("blur", () => {
    // Delay hiding results to allow clicks on results
    setTimeout(() => {
      searchResults.classList.remove("show");
    }, 200);
  });

  searchResults.addEventListener("click", (e) => {
    if (e.target.classList.contains("search-result-item")) {
      const serviceData = e.target.getAttribute("data-service");
      if (serviceData) {
        const service = JSON.parse(serviceData);
        addService(service);
      }
    }
  });

  selectedServices.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-button")) {
      const serviceName = e.target.getAttribute("data-service");
      removeService(serviceName);
    }
  });

  copyButton.addEventListener("click", () => {
    const generatedCode = generateOutput();
    const originalContent = copyButton.innerHTML;

    navigator.clipboard
      .writeText(generatedCode)
      .then(() => {
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyButton.classList.add("btn-success");
        setTimeout(() => {
          copyButton.innerHTML = originalContent;
          copyButton.classList.remove("btn-success");
        }, 2000);
      })
      .catch((err) => {
        alert("Failed to copy text.");
        console.error("Copy error", err);
      });
  });

  downloadButton.addEventListener("click", () => {
    const generatedCode = generateOutput();
    const originalContent = downloadButton.innerHTML;

    downloadButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Downloading...';

    const blob = new Blob([generatedCode], {
      type: "text/javascript",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "META.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      downloadButton.innerHTML = originalContent;
    }, 1000);
  });

  themeToggle.addEventListener("click", toggleTheme);

  // Initialize
  initTheme();
  fetchServices();
});
