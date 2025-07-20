# META.js Customizer

## 🎯 Overview

META.js Customizer is a modern, intuitive web app that allows users to easily create custom META.js of [xixu-me/META](https://github.com/xixu-me/META). It provides a beautiful visual interface to select and configure service rulesets from the [xixu-me/RFM](https://github.com/xixu-me/RFM) repository.

### ✨ Key Features

- 🔍 **Smart Service Search**: Instantly search and filter through all available services
- 👁️ **Domain Preview**: Click preview buttons to view domain lists and rules for each service
- 🎨 **Modern Glass UI**: Beautiful, responsive design with glassmorphism effects
- 🌙 **Intelligent Theming**: Auto-detects system theme with manual override options
- 📱 **Mobile Responsive**: Seamlessly adapts to all device sizes
- 🚀 **Real-time Generation**: Instantly generates META.js as you select services
- 📋 **One-click Copy**: Copy generated configuration to clipboard with visual feedback
- 💾 **Download Support**: Download your configuration as META.js file
- ♿ **Accessibility First**: WCAG compliant with full keyboard navigation support
- 🎯 **Modern Architecture**: Clean, modular codebase with BEM methodology

## 🚀 Quick Start

### Online Usage (Recommended)

Visit **[metajs.xi-xu.me](https://metajs.xi-xu.me)** to use the customizer directly in your browser.

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/xixu-me/META.js-Customizer.git
   cd META.js-Customizer
   ```

2. **Serve the files**

   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   
   # Or simply open index.html in your browser
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` (or your chosen port)

## 📖 Usage Guide

### Basic Workflow

1. **🔍 Search for Services**: Use the search bar to find services you want to include
2. **👁️ Preview Domains**: Click "Preview" buttons to see domain rules for each service
3. **✅ Select Services**: Click on search results to add them to your configuration
4. **📝 Review Selection**: Check your selected services in the main panel
5. **⚙️ Generate Configuration**: Your META.js is automatically generated in real-time
6. **📋 Copy or Download**: Use the action buttons to copy or download your configuration

### 👁️ Domain Preview Feature

The Domain Preview functionality allows you to inspect the domain rules for any service before adding it to your configuration:

#### **Preview Access**

- **Search Results**: Click the "Preview" button next to any service in search results
- **Selected Services**: Click the "Preview" button next to selected services to review their domains

#### **Domain Categories**

The preview modal organizes domains into three categories:

- **📍 Exact Domains**: Specific domain matches (e.g., `github.com`, `api.github.com`)
- **🌐 Domain Suffixes**: Wildcard domain patterns that match subdomains (e.g., `+.google.com`)
- **🔑 Pattern Rules**: Keyword-based and advanced pattern matching rules

#### **Interactive Features**

- **Collapsible Categories**: Click category headers to expand/collapse domain lists
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Real-time Loading**: Fetches latest domain data directly from the RFM repository
- **Error Handling**: Clear feedback if domain data cannot be loaded

#### **Technical Details**

- **Data Source**: Fetches YAML files directly from [xixu-me/RFM](https://github.com/xixu-me/RFM/tree/universal/yaml)
- **Smart Parsing**: Automatically categorizes domains based on prefixes and patterns
- **Glassmorphism UI**: Beautiful modal interface with backdrop blur effects

### Service Configuration Logic

Service icons are sourced from [xixu-me/favicons](https://github.com/xixu-me/favicons). Auto-generated configurations may require manual adjustments based on availability:

#### Configuration Rules

- **🚫 Icon Unavailable**: Uses specific `domain` for services requiring custom domains
  - *Example*: `rednote` → `{ name: "rednote", domain: "xiaohongshu.com" }`
  
- **✅ Icon Available**: Uses only `tld` when service name matches Second-Level Domain
  - *Example*: `github` → `{ name: "GitHub", tld: "com" }`

- **🔧 Name Mismatch**: Adds `sld` when name doesn't match SLD
  - *Example*: `xai` → `{ name: "xAI", sld: "x", tld: "ai" }`

### Theme Options

Click the theme toggle button to cycle through:

- 🌙 **Auto**: Follows system preference (default)
- ☀️ **Light**: Force light mode  
- 🌙 **Dark**: Force dark mode

The app automatically detects system theme changes and applies them when in auto mode.

## 🏗️ Architecture

The META.js Customizer follows a modern, modular architecture designed for maintainability, scalability, and performance:

### 🧩 Component-Based Design

#### **🎨 ThemeManager**

- Handles system theme detection and manual switching
- Supports auto, light, and dark modes with smooth transitions
- Persists user preferences in localStorage
- Responsive to system theme changes

#### **🔍 ServicesManager**

- Fetches and caches services from RFM repository via GitHub API
- Implements debounced search for optimal performance
- Manages service selection state with event-driven updates
- Provides real-time filtering and search capabilities
- Integrates domain preview functionality with preview buttons

#### **👁️ DomainPreviewManager**

- Fetches and parses YAML domain files from RFM repository
- Intelligent domain categorization (exact, suffixes, patterns)
- Modal-based preview interface with glassmorphism design
- Real-time domain data loading with error handling
- Responsive design for mobile and desktop viewing

#### **⚙️ ServiceConfigGenerator**

- Intelligent favicon detection from xixu-me/favicons repository
- Smart configuration generation with domain parsing
- Handles special cases and complex domain patterns
- Caches favicon availability for performance optimization

#### **📤 OutputManager**

- Real-time META.js code generation and preview
- Clipboard integration with comprehensive error handling
- File download functionality with progress feedback
- Template management and dynamic content substitution

#### **🎯 MetaJSCustomizer (Main Controller)**

- App lifecycle management and component orchestration
- Global error handling with user-friendly feedback
- Performance monitoring and optimization
- Loading state management and initialization coordination

### 🚀 Modern JavaScript Features

- **ES6+ Modules**: Clean import/export system for better organization
- **Async/Await**: Modern asynchronous programming patterns
- **Error Boundaries**: Comprehensive error handling with user feedback
- **Event-Driven Architecture**: Loose coupling between components
- **Performance Optimization**: Debouncing, caching, and efficient DOM operations

### 🎨 Enhanced UI/UX

- **Glassmorphism Design**: Modern glass effects with backdrop blur
- **Smooth Animations**: CSS-based transitions and micro-interactions
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes
- **Accessibility First**: ARIA labels, semantic HTML, and keyboard navigation
- **Loading States**: Clear feedback during async operations

### 💻 Technology Stack

- **Frontend**: Modern HTML5, CSS3, JavaScript (ES2020+)
- **Architecture**: Component-based modular design with ES6 modules
- **Styling**: CSS Custom Properties, CSS Grid/Flexbox, Glassmorphism effects
- **Methodology**: BEM (Block Element Modifier) for CSS organization
- **Icons**: Font Awesome 6.5.1 for consistent iconography
- **API Integration**: GitHub REST API for dynamic service fetching
- **Performance**: Debounced search, caching strategies, optimized DOM operations
- **Accessibility**: WCAG 2.1 AA compliant with comprehensive ARIA support
- **Build**: Zero-build architecture - runs directly in modern browsers

## 🎨 Design Features

### Glassmorphism UI

- **Translucent cards** with backdrop blur effects
- **Smooth animations** and micro-interactions
- **Modern button interactions** with liquid shine effects
- **Depth and hierarchy** through layered glass elements

### Responsive Design

- **Mobile-first approach** with progressive enhancement
- **Adaptive layouts** for all screen sizes (320px+)
- **Touch-friendly interface** elements with proper hit targets
- **Optimized typography** scaling across devices

### Accessibility Features

- **Semantic HTML structure** for screen readers
- **ARIA labels and roles** for enhanced accessibility
- **Keyboard navigation support** for all interactive elements
- **High contrast mode support** for visual accessibility
- **Reduced motion support** for users with vestibular disorders
- **Focus management** with visible focus indicators

### Performance Optimizations

- **Minimal dependencies** - vanilla JavaScript only
- **CSS custom properties** for efficient theming
- **Debounced search** to reduce API calls
- **Lazy loading** of non-critical resources
- **Optimized animations** with `transform` and `opacity`

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

## 🤝 Related Projects

- **[xixu-me/META](https://github.com/xixu-me/META)** - The main META.js repository
- **[xixu-me/RFM](https://github.com/xixu-me/RFM)** - Rulesets
- **[xixu-me/favicons](https://github.com/xixu-me/favicons)** - Service icons repository
