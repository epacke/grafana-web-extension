// Script Manager - activates page scripts based on URL matching
import { logger, Logger, updateLogLevelFromConfig, getLogLevel } from './utils/Logger';
import { configLoaded } from './utils/config';

logger.info('=== SCRIPT MANAGER LOADING ===');
logger.debug('URL:', window.location.href);
logger.debug('Document readyState:', document.readyState);

logger.debug('About to import modules...');
import { GrafanaAlertBadgeScript } from './pageMods/Grafana/GrafanaSidebarModifications';
import { PageScript } from './pageMods/PageScript';
import { GrafanaDashboardQueryCopyButton } from './pageMods/Grafana/EditPanelModifications';
import { GrafanaDashboardDashboardModifications } from './pageMods/Grafana/DashboardModifications';
import { GrafanaAlertingListModifications } from './pageMods/Grafana/AlertingListModifications';
logger.debug('Imports completed successfully');

// Load config BEFORE initializing scripts - ensures config is available synchronously
// After this, scripts can import { config } from './utils/config' and use it directly
(async () => {
  try {
    await configLoaded; // Wait for config to load (from utils/config module)
    const logLevel = getLogLevel();
    logger.info(`Setting log level from config: ${logLevel}`);
    updateLogLevelFromConfig(logLevel);
    logger.info('Config loaded successfully - scripts can now import { config } from utils/config');
  } catch (error) {
    logger.warn('Failed to load config for log level, using default', error);
  }
})();

interface PageScriptConfig {
  class: new () => PageScript;
}

class ScriptManager {
  private scripts: PageScriptConfig[] = [];
  private activeScripts: Map<string, PageScript> = new Map();
  private urlObserver: MutationObserver | null = null;
  private currentUrl: string = window.location.href;
  private logger: Logger;

  constructor() {
    // Use configured log level from ConfigLoader
    const logLevel = getLogLevel();
    this.logger = new Logger({
      prefix: 'Script Manager',
      level: logLevel
    });
    
    this.logger.info("Script Manager initialized");
    this.logger.debug(`Current URL: ${window.location.href}`);
    this.logger.debug(`Document ready state: ${document.readyState}`);
    this.setupUrlObserver();
    
    // Check current page immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.logger.debug('DOMContentLoaded fired, checking current page');
        this.checkCurrentPage();
      });
    } else {
      // DOM is already ready
      this.logger.debug('DOM already ready, checking current page immediately');
      this.checkCurrentPage();
    }
  }

  public registerPageScript(config: PageScriptConfig): void {
    this.scripts.push(config);
    this.logger.info(`Registered page script: ${config.class.name}`);
    
    // Check if current page matches this new script (only if DOM is ready)
    if (document.readyState !== 'loading') {
      const scriptInstance = new config.class();
      const matches = scriptInstance.matches();
      this.logger.debug(`Script ${config.class.name} matches current URL: ${matches}`);
      if (matches) {
        this.activateScriptInstance(scriptInstance);
      }
    } else {
      this.logger.debug(`DOM not ready yet, will check ${config.class.name} after DOMContentLoaded`);
    }
  }

  private setupUrlObserver(): void {
    // Watch for URL changes (for SPAs)
    this.urlObserver = new MutationObserver(() => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        this.logger.debug(`URL changed to: ${this.currentUrl}`);
        this.handleUrlChange();
      }
    }); 

    this.urlObserver.observe(document, { 
      subtree: true, 
      childList: true 
    });
  }

  private checkCurrentPage(): void {
    // Check if current page matches any registered scripts
    this.scripts.forEach(scriptConfig => {
      const scriptInstance = new scriptConfig.class();
      if (scriptInstance.matches()) {
        this.activateScriptInstance(scriptInstance);
      }
    });
  }

  private handleUrlChange(): void {
    // Clean up scripts that no longer match
    this.activeScripts.forEach((script, key) => {
      if (!script.matches()) {
        this.deactivateScript(key);
      }
    });

    // Activate scripts that now match
    this.scripts.forEach(scriptConfig => {
      const scriptInstance = new scriptConfig.class();
      if (scriptInstance.matches() && !this.isScriptActive(scriptInstance)) {
        this.activateScriptInstance(scriptInstance);
      }
    });
  }

  private isScriptActive(scriptInstance: PageScript): boolean {
    return Array.from(this.activeScripts.values()).some(
      activeScript => activeScript.constructor === scriptInstance.constructor
    );
  }

  private activateScriptInstance(scriptInstance: PageScript): void {
    if (this.isScriptActive(scriptInstance)) {
      this.logger.debug(`Script ${scriptInstance.constructor.name} is already active, skipping`);
      return; // Already active
    }

    this.logger.info(`Activating script: ${scriptInstance.constructor.name}`);
    this.logger.debug(`URL check: host=${window.location.host}, path=${window.location.pathname}`);

    try {
      // Initialize the script instance
      scriptInstance.initialize();
      
      this.activeScripts.set(scriptInstance.constructor.name, scriptInstance);
      this.logger.info(`Successfully activated script: ${scriptInstance.constructor.name}`);
    } catch (error) {
      this.logger.error(`Failed to initialize ${scriptInstance.constructor.name}`, error);
      if (error instanceof Error) {
        this.logger.error(`Error stack`, error.stack);
      }
    }
  }

  private deactivateScript(key: string): void {
    const script = this.activeScripts.get(key);
    if (!script) return;

    this.logger.info(`Deactivating script: ${script.constructor.name}`);
    if (script instanceof PageScript && 'cleanup' in script) {
      (script as any).cleanup();
    }
    this.activeScripts.delete(key);
  }

  // Public API for debugging
  public getActiveScripts(): string[] {
    return Array.from(this.activeScripts.keys());
  }

  public getRegisteredScripts(): string[] {
    return this.scripts.map(script => script.class.name);
  }
}

// Initialize the script manager after config is loaded
(async () => {
  try {
    await configLoaded; // Wait for config to load before initializing scripts
    logger.info('Config loaded, initializing ScriptManager...');
    
    const manager = new ScriptManager();

    // Register all page scripts
    logger.info('Registering page scripts...');
    [
      GrafanaAlertBadgeScript,
      GrafanaDashboardDashboardModifications,
      GrafanaDashboardQueryCopyButton,
      GrafanaAlertingListModifications
      // Add more page script classes here as needed
    ].forEach(ScriptClass => {
      logger.debug(`Registering: ${ScriptClass.name}`);
      manager.registerPageScript({ class: ScriptClass });
    });
    logger.info('All scripts registered');

    // Export debugging functions globally
    (window as any).scriptManager = {
      getActiveScripts: () => manager.getActiveScripts(),
      getRegisteredScripts: () => manager.getRegisteredScripts(),
      getCurrentUrl: () => window.location.href
    };
  } catch (error) {
    logger.error('Failed to initialize ScriptManager:', error);
  }
})();
