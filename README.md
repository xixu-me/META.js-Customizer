# META.js Customizer

## 🎯 Overview

META.js Customizer is a modern, intuitive web application that allows users to easily create custom META.js configurations for [xixu-me/META](https://github.com/xixu-me/META). It provides a beautiful visual interface to select and configure service rulesets from the [xixu-me/RFM](https://github.com/xixu-me/RFM) repository.

### ✨ Key Features

- 🔍 **Smart Service Search**: Instantly search and filter through all available services
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
2. **✅ Select Services**: Click on search results to add them to your configuration
3. **📝 Review Selection**: Check your selected services in the main panel
4. **⚙️ Generate Configuration**: Your META.js is automatically generated in real-time
5. **📋 Copy or Download**: Use the action buttons to copy or download your configuration

### Service Configuration Logic

Service icons are sourced from [xixu-me/favicons](https://github.com/xixu-me/favicons). The application uses intelligent heuristics to generate optimal configurations:

#### Configuration Rules

- **🚫 Icon Unavailable**: Uses specific `domain` for services requiring custom domains
  - *Example*: `rednote` → `{ name: "rednote", domain: "xiaohongshu.com" }`
  
- **✅ Icon Available**: Uses only `tld` when service name matches Second-Level Domain
  - *Example*: `github` → `{ name: "GitHub", tld: "com" }`

- **🔧 Name Mismatch**: Adds `sld` when name doesn't match SLD
  - *Example*: `xai` → `{ name: "xAI", sld: "x", tld: "ai" }`

- **🌐 Google Services**: Special handling for Google ecosystem
  - *Example*: `google-drive` → `{ name: "google-drive", tld: "google", alias: "google-drive" }`

### Theme Options

Click the theme toggle button to cycle through:

- 🌙 **Auto**: Follows system preference (default)
- ☀️ **Light**: Force light mode  
- 🌙 **Dark**: Force dark mode

The application automatically detects system theme changes and applies them when in auto mode.

## 🏗️ Architecture

### Project Structure

```text
META.js-Customizer/
├── src/
│   ├── scripts/
│   │   └── main.js           # Main application logic
│   ├── styles/
│   │   └── main.css          # Modern CSS with BEM methodology
│   └── templates/
│       └── meta-template.js  # META.js configuration template
├── index.html                # Main HTML file
├── CNAME                     # GitHub Pages domain
├── LICENSE                   # GPL-3.0 License
└── README.md                 # This file
```

### Key Components

#### 🎨 **ThemeManager**

- Handles theme detection, switching, and persistence
- Supports system theme detection with auto-switching
- Smooth theme transitions with CSS custom properties

#### 🔍 **ServicesManager**

- Retrieves available services from RFM repository via GitHub API
- Real-time filtering and searching of services
- Intelligent service configuration generation
- Selected services management with persistence

#### ⚙️ **ServiceConfigGenerator**

- Smart favicon detection and URL generation
- Service-specific configuration logic
- Handles complex domain patterns and special cases

#### 📤 **OutputManager**

- Real-time META.js generation
- Clipboard integration with error handling
- File download functionality with progress indication

#### 🎯 **MetaJSCustomizer**

- Main application controller
- Error handling and user feedback
- Component orchestration and lifecycle management

### Technology Stack

- **Frontend**: Modern HTML5, CSS3, JavaScript (ES2020+)
- **Styling**: CSS Custom Properties, CSS Grid/Flexbox, Glassmorphism
- **Methodology**: BEM (Block Element Modifier) for CSS organization
- **Icons**: Font Awesome 6.5.1
- **API**: GitHub REST API for dynamic service fetching
- **Build**: No build process required - runs directly in browser

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

## 🛠️ Development

### Code Standards

- **Modern JavaScript (ES2020+)** with proper error handling
- **BEM methodology** for CSS class naming
- **JSDoc comments** for comprehensive documentation  
- **Consistent formatting** with Prettier-style guidelines
- **Semantic HTML** with proper accessibility attributes

### Browser Support

- **Chrome** 88+ ✅
- **Firefox** 85+ ✅  
- **Safari** 14+ ✅
- **Edge** 88+ ✅

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

## 🤝 Related Projects

- **[xixu-me/META](https://github.com/xixu-me/META)** - The main META.js project
- **[xixu-me/RFM](https://github.com/xixu-me/RFM)** - Rule sets and filters
- **[xixu-me/favicons](https://github.com/xixu-me/favicons)** - Service icons repository

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/xixu-me/META.js-Customizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xixu-me/META.js-Customizer/discussions)
- **Website**: [metajs.xi-xu.me](https://metajs.xi-xu.me)

---

**Built with ❤️ by [xixu-me](https://github.com/xixu-me)**

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
