# Script Manager Chrome Extension - Simple Observer System

## ** Script Management**

This extension provides a minimal, clean script management system with a simple observer pattern. No complex inheritance, no UI, just a simple `waitFor()` function.

## 🏗️ **Architecture**

### **Single Content Script**
The extension runs one content script on all pages that provides a simple `waitFor()` function:

```typescript
waitFor(urlRegex: RegExp, cssSelector: string | null, scriptFunction: () => void)
```

### **How It Works**
1. **URL Matching**: Uses regex to match page URLs
2. **Element Waiting**: Optionally waits for CSS selectors to appear
3. **Script Execution**: Runs your function when conditions are met
4. **SPA Support**: Automatically detects URL changes in single-page apps

## ✨ **Usage Examples**

### **Basic URL Matching**
```typescript
waitFor(
  /^https?:\/\/www\.google\.com/,
  null, // No CSS selector needed
  () => {
    console.log('Google page detected!');
    // Your script here
  }
);
```

### **Wait for Specific Element**
```typescript
waitFor(
  /^https?:\/\/github\.com/,
  '.Header', // Wait for GitHub header
  () => {
    console.log('GitHub header loaded!');
    // Modify the header
  }
);
```

### **Complex URL Pattern**
```typescript
waitFor(
  /^https?:\/\/www\.youtube\.com\/watch/,
  '#movie_player', // Wait for video player
  () => {
    console.log('YouTube video page loaded!');
    // Block ads or modify player
  }
);
```

## 📝 **Example Scripts**

### **Google Page Modifier**
```typescript
waitFor(
  /^https?:\/\/www\.google\.com/,
  null,
  () => {
    // Add banner to Google pages
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px;
      text-align: center;
      z-index: 10000;
    `;
    banner.textContent = '🚀 Script Manager Active!';
    document.body.insertBefore(banner, document.body.firstChild);
  }
);
```

### **GitHub Enhancement**
```typescript
waitFor(
  /^https?:\/\/github\.com/,
  '.Header',
  () => {
    // Custom GitHub styling
    const style = document.createElement('style');
    style.textContent = `
      .Header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      }
    `;
    document.head.appendChild(style);
  }
);
```

### **YouTube Ad Blocker**
```typescript
waitFor(
  /^https?:\/\/www\.youtube\.com/,
  '#movie_player',
  () => {
    // Block ads
    const observer = new MutationObserver(() => {
      const ads = document.querySelectorAll('[id*="ad"], [class*="ad"]');
      ads.forEach(ad => ad.style.display = 'none');
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
);
```

## 🚀 **Installation & Usage**

1. **Build the extension:**
   ```bash
   cd web-extensions
   export PATH="/Users/patrik/.nvm/versions/node/v22.20.0/bin:$PATH"
   npm run build
   ```

2. **Load in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → select `dist` folder

3. **Add your scripts:**
   - Edit `src/example-scripts.ts`
   - Add your `waitFor()` calls
   - Rebuild and reload

4. **Configure the extension:**
   - Copy the example config: `cp config/config.yaml.example config/config.yaml`
   - Edit `config/config.yaml` with your settings
   - Note: `config.yaml` is gitignored and won't be committed to the repository

## ⚙️ **Configuration**

The extension uses a YAML configuration file located at `config/config.yaml`. This file is gitignored to keep your private configuration out of the repository.

### Setup

1. Copy the example configuration:
   ```bash
   cp config/config.yaml.example config/config.yaml
   ```

2. Edit `config/config.yaml` with your actual configuration values (domains, labels, etc.)

3. Rebuild the extension to include your config:
   ```bash
   npm run build
   ```

The `config.yaml.example` file serves as a template and is committed to the repository, while your actual `config.yaml` remains local and private.

## 🔧 **API Reference**

### **waitFor(urlRegex, cssSelector, scriptFunction)**

- **urlRegex**: `RegExp` - Regex pattern to match URLs
- **cssSelector**: `string | null` - CSS selector to wait for (optional)
- **scriptFunction**: `() => void` - Function to execute when conditions are met

### **URL Patterns**
```typescript
// Exact domain
/^https?:\/\/www\.google\.com/

// Any Google subdomain
/^https?:\/\/.*\.google\.com/

// Specific path
/^https?:\/\/github\.com\/.*\/issues/

// YouTube videos only
/^https?:\/\/www\.youtube\.com\/watch/

// All HTTPS sites
/^https:\/\//
```

### **CSS Selectors**
```typescript
// Wait for header
'.Header'

// Wait for specific element
'#movie_player'

// Wait for any element with class
'.dynamic-content'

// Complex selector
'div.container > .content'
```

## 🎯 **Key Features**

- **✅ Simple API**: Just one function to learn
- **✅ URL Matching**: Flexible regex patterns
- **✅ Element Waiting**: Wait for DOM elements to appear
- **✅ SPA Support**: Automatically handles URL changes
- **✅ No UI**: Pure functionality, no interface needed
- **✅ TypeScript**: Full type safety
- **✅ Performance**: Minimal overhead, runs only when needed

## 📁 **File Structure**

```
src/
├── manifest.json          # Extension configuration
├── background.ts          # Background script (minimal)
├── main-script.ts         # Core waitFor() system
├── example-scripts.ts     # Your custom scripts
├── types.d.ts            # TypeScript declarations
└── icons/                 # Extension icons
```

## 🐛 **Debugging**

Scripts log to the browser console:
```javascript
[Script Manager] Script Manager initialized
[Script Manager] Added observer for URL: /^https?:\/\/www\.google\.com/, CSS: none
[Script Manager] URL changed to: https://www.google.com/search?q=test
[Script Manager] Executed script for URL: /^https?:\/\/www\.google\.com/
```

## 💡 **Tips**

1. **Use specific selectors**: Wait for elements that indicate the page is ready
2. **Test regex patterns**: Use browser console to test your URL patterns
3. **Handle errors**: Wrap your script functions in try-catch blocks
4. **Use console.log**: Debug your scripts with console output

---

**Simple, powerful, flexible script management!** 🚀