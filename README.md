# META.js Customizer

## 🎯 Overview

META.js Customizer is an intuitive web app that allows users to easily create custom META.js of [xixu-me/META](https://github.com/xixu-me/META). It provides a visual interface to select and configure service rulesets from [xixu-me/RFM](https://github.com/xixu-me/RFM) repository.

### ✨ Key Features

- 🔍 **Smart Service Search**: Instantly search and filter through all available services
- 🎨 **Modern Glass UI**: Beautiful, responsive design with dark/light theme support
- 🌙 **Intelligent Theming**: Auto-detects system theme with manual override options
- 📱 **Mobile Responsive**: Works seamlessly on all device sizes
- 🚀 **Real-time Generation**: Instantly generates META.js configuration as you select services
- 📋 **One-click Copy**: Copy generated configuration to clipboard
- 💾 **Download Support**: Download your configuration as META.js file

## 🚀 Quick Start

### Online Usage (Recommended)

Visit [metajs.xi-xu.me](https://metajs.xi-xu.me) to use the customizer directly in your browser.

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/xixu-me/META.js-Customizer.git
   cd META.js-Customizer
   ```

2. **Serve the files**

   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server

   # Or simply open index.html in your browser
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` (or your chosen port)

## 📖 Usage

### Basic Workflow

1. **Search for Services**: Use the search bar to find services you want to include
2. **Select Services**: Click on search results to add them to your configuration
3. **Review Selection**: Check your selected services in the main panel
4. **Generate Configuration**: Your META.js configuration is automatically generated
5. **Copy or Download**: Use the action buttons to copy or download your configuration

### Service Configuration

Service icons are sourced from [xixu-me/favicons](https://github.com/xixu-me/favicons). Auto-generated configurations may require manual adjustments based on availability.

- **Icon Unavailable**: Uses specific `domain` for services requiring custom domains
  - Example: `rednote` → `{ name: "rednote", domain: "xiaohongshu.com" }`
  
- **Icon Available**: Uses only `tld` when service name matches Second-Level Domain
  - Example: `github` → `{ name: "GitHub", tld: "com" }`

- **Name does not match SLD**: Adds `sld` for services with non-standard naming
  - Example: `xai` → `{ name: "xAI", sld: "x", tld: "ai" }`

### Theme Options

Click the theme toggle button to cycle through:

- 🌙 **Auto**: Follows system preference (default)
- ☀️ **Light**: Force light mode
- 🌙 **Dark**: Force dark mode

## 🏗️ Architecture

### Key Components

- **Service Fetcher**: Retrieves available services from RFM repository via GitHub API
- **Search Engine**: Real-time filtering and matching of services
- **Configuration Generator**: Creates META.js configuration with proper formatting
- **Theme Manager**: Handles theme detection, switching, and persistence
- **UI Controller**: Manages user interactions and visual feedback

### Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, CSS Grid/Flexbox, Backdrop Filter
- **Icons**: Font Awesome 6
- **API**: GitHub REST API for fetching service data

## 🎨 Design Features

### Glass Morphism UI

- Translucent cards with backdrop blur effects
- Smooth animations and transitions
- Modern button interactions with liquid shine effects

### Responsive Design

- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface elements

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly labels

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
