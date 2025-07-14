/**
 * Service Configuration Generator
 *
 * Simplified service configuration generator that creates
 * uniform configurations for all services using the pattern:
 * { name: "serviceName", tld: "com" }
 *
 * @author xixu-me
 * @license GPL-3.0
 */

export class ServiceConfigGenerator {
  constructor() {
    // Simplified constructor - no complex logic needed
  }

  /**
   * Generate configuration for a single service
   * @param {string} serviceName - Service name
   * @returns {Promise<Object>} Service configuration object
   */
  async generateServiceConfig(serviceName) {
    // Simplified: all services use name and tld: "com"
    return {
      name: serviceName,
      tld: "com",
    };
  }

  /**
   * Generate configurations for multiple services
   * @param {Array<string>} serviceNames - Array of service names
   * @returns {Promise<Array<Object>>} Array of service configuration objects
   */
  async generateServiceConfigs(serviceNames) {
    const configs = await Promise.all(
      serviceNames.map((name) => this.generateServiceConfig(name))
    );

    return configs;
  }

  /**
   * Convert service configuration to string representation
   * @param {Object} config - Service configuration object
   * @returns {string} String representation of configuration
   */
  configToString(config) {
    // Simplified: always use name and tld format
    return `{ name: "${config.name}", tld: "${config.tld}" }`;
  }

  /**
   * Convert multiple service configurations to formatted string
   * @param {Array<Object>} configs - Array of service configuration objects
   * @returns {string} Formatted string representation
   */
  configsToString(configs) {
    return configs
      .map((config) => `  ${this.configToString(config)}`)
      .join(",\n");
  }
}
