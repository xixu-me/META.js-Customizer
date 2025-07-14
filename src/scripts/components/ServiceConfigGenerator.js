/**
 * Service Configuration Generator
 *
 * Handles intelligent service configuration generation with:
 * - Smart favicon detection and URL generation
 * - Service-specific configuration logic
 * - Complex domain patterns and special cases handling
 * - Integration with xixu-me/favicons repository
 *
 * @author xixu-me
 * @license GPL-3.0
 * @version 2.0.0
 */

export class ServiceConfigGenerator {
  constructor() {
    this.faviconBaseUrl =
      "https://raw.githubusercontent.com/xixu-me/favicons/main/";
    this.faviconCache = new Map();

    // Special domain mappings for services that don't follow standard patterns
    this.specialDomains = new Map([
      ["rednote", "xiaohongshu.com"],
      ["xai", "x.ai"],
      ["discord", "discord.com"],
      ["telegram", "t.me"],
      ["whatsapp", "web.whatsapp.com"],
      ["instagram", "instagram.com"],
      ["facebook", "facebook.com"],
      ["twitter", "twitter.com"],
      ["x", "x.com"],
      ["linkedin", "linkedin.com"],
      ["tiktok", "tiktok.com"],
      ["youtube", "youtube.com"],
      ["reddit", "reddit.com"],
      ["github", "github.com"],
      ["gitlab", "gitlab.com"],
      ["bitbucket", "bitbucket.org"],
      ["stackoverflow", "stackoverflow.com"],
      ["medium", "medium.com"],
      ["dev", "dev.to"],
      ["hashnode", "hashnode.com"],
      ["notion", "notion.so"],
      ["figma", "figma.com"],
      ["spotify", "spotify.com"],
      ["apple-music", "music.apple.com"],
      ["netflix", "netflix.com"],
      ["amazon", "amazon.com"],
      ["ebay", "ebay.com"],
      ["aliexpress", "aliexpress.com"],
      ["taobao", "taobao.com"],
      ["jd", "jd.com"],
    ]);
  }

  /**
   * Check if favicon exists for a service
   * @param {string} serviceName - Service name to check
   * @returns {Promise<boolean>} True if favicon exists
   */
  async checkFaviconExists(serviceName) {
    if (this.faviconCache.has(serviceName)) {
      return this.faviconCache.get(serviceName);
    }

    try {
      const response = await fetch(`${this.faviconBaseUrl}${serviceName}.svg`, {
        method: "HEAD",
      });
      const exists = response.ok;
      this.faviconCache.set(serviceName, exists);
      return exists;
    } catch (error) {
      console.warn(`Failed to check favicon for ${serviceName}:`, error);
      this.faviconCache.set(serviceName, false);
      return false;
    }
  }

  /**
   * Parse domain into components (SLD and TLD)
   * @param {string} domain - Domain to parse
   * @returns {Object} Object with sld and tld properties
   */
  parseDomain(domain) {
    const parts = domain.split(".");

    if (parts.length < 2) {
      throw new Error(`Invalid domain: ${domain}`);
    }

    // Handle special TLDs like .co.uk, .com.au, etc.
    const specialTlds = [
      "co.uk",
      "com.au",
      "co.jp",
      "co.kr",
      "com.br",
      "co.in",
    ];
    const lastTwoParts = parts.slice(-2).join(".");

    if (specialTlds.includes(lastTwoParts)) {
      return {
        sld: parts[parts.length - 3] || parts[parts.length - 2],
        tld: lastTwoParts,
      };
    }

    return {
      sld: parts[parts.length - 2],
      tld: parts[parts.length - 1],
    };
  }

  /**
   * Generate configuration for a single service
   * @param {string} serviceName - Service name
   * @returns {Promise<Object>} Service configuration object
   */
  async generateServiceConfig(serviceName) {
    const config = { name: serviceName };

    // Check if service has special domain mapping
    if (this.specialDomains.has(serviceName)) {
      const domain = this.specialDomains.get(serviceName);

      // Check if favicon exists
      const faviconExists = await this.checkFaviconExists(serviceName);

      if (!faviconExists) {
        // Use full domain if no favicon
        config.domain = domain;
      } else {
        // Parse domain and use components
        try {
          const { sld, tld } = this.parseDomain(domain);

          // If service name matches SLD, only use TLD
          if (serviceName.toLowerCase() === sld.toLowerCase()) {
            config.tld = tld;
          } else {
            // Service name doesn't match SLD, include both
            config.sld = sld;
            config.tld = tld;
          }
        } catch (error) {
          console.warn(
            `Failed to parse domain ${domain} for ${serviceName}:`,
            error
          );
          config.domain = domain;
        }
      }
    } else {
      // Standard service - assume serviceName.com pattern
      const faviconExists = await this.checkFaviconExists(serviceName);

      if (!faviconExists) {
        // Fallback to full domain
        config.domain = `${serviceName}.com`;
      } else {
        // Use TLD only
        config.tld = "com";
      }
    }

    return config;
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
    const parts = [`name: "${config.name}"`];

    if (config.tld) {
      parts.push(`tld: "${config.tld}"`);
    }

    if (config.sld) {
      parts.push(`sld: "${config.sld}"`);
    }

    if (config.domain) {
      parts.push(`domain: "${config.domain}"`);
    }

    if (config.alias) {
      parts.push(`alias: "${config.alias}"`);
    }

    return `{ ${parts.join(", ")} }`;
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

  /**
   * Clear favicon cache (useful for testing or forced refresh)
   */
  clearCache() {
    this.faviconCache.clear();
  }

  /**
   * Get cached favicon status for debugging
   * @returns {Map} Map of cached favicon statuses
   */
  getCacheStatus() {
    return new Map(this.faviconCache);
  }
}
