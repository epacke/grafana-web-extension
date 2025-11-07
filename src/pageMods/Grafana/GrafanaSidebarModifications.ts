// Grafana alert badge - adds "Rancher alerts" menu item with badges
import { PageScript } from '../PageScript';
import { AlertsButton } from './Components/RancherAlertsButton';
import { GrafanaMenuLink } from './Components/GrafanaMenuButton';
import { SidebarSeparator } from './Components/SidebarSeparator';
import { config } from '../../utils/config';
import { IAlertButton, IStaticLink } from '../../interfaces/IConfig';

class GrafanaAlertBadgeScript extends PageScript {
  private buttons: Map<string, AlertsButton> = new Map();
  private sidebarObserver: MutationObserver | null = null;
  private reAddTimeout: number | null = null;

  /**
   * Check if a domain matches the domain filter
   * Supports exact match and wildcard patterns (e.g., *.xip.se)
   */
  private matchesDomain(domainFilter: string | undefined, currentHost: string): boolean {
    if (!domainFilter) {
      // No domain filter means it applies to all domains
      return true;
    }

    // Exact match
    if (domainFilter === currentHost) {
      return true;
    }

    // Wildcard pattern matching (e.g., *.xip.se)
    if (domainFilter.startsWith('*.')) {
      const suffix = domainFilter.substring(2); // Remove '*.' prefix
      return currentHost.endsWith('.' + suffix) || currentHost === suffix;
    }

    // If no match, return false
    return false;
  }

  /**
   * Check if a menu item (button or link) already exists in the DOM
   * @param name The name of the menu item
   * @param dataAttribute The data attribute name to search for (e.g., 'data-alert-button-name' or 'data-static-link-name')
   * @returns true if the item exists in the DOM
   */
  private menuItemExists(name: string, dataAttribute: string): boolean {
    const existingItem = document.querySelector(`a[${dataAttribute}="${name}"]`);
    return existingItem !== null;
  }

  /**
   * Generate label filter string for URL parameters
   */
  private generateLabelFilter(labels: Record<string, any>, exclude: boolean = false): string {
    const params: string[] = [];
    
    for (const [key, value] of Object.entries(labels)) {
      if (value === null || value === undefined) continue;
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      if (exclude) {
        params.push(`${encodedKey}!=${encodedValue}`);
      } else {
        params.push(`${encodedKey}=${encodedValue}`);
      }
    }
    
    return params.join(',');
  }


  constructor() {
    // Match grafana.xip.se host and any URI
    super(
      /^grafana\.xip\.se$/,
      /^\/.*$/
    );
  }

  protected override execute(): void {
    this.log('Executing Grafana page script');
    this.log(`Current URL: ${window.location.href}`);
    this.log(`Host: ${window.location.host}, Path: ${window.location.pathname}`);
    
    // Wait for the side menu to appear
    this.log('Waiting for side menu element...');
    this.waitForElement('[data-testid="data-testid navigation mega-menu"] ul[aria-label="Navigation"]').then(async (sidemenu: HTMLElement) => {
      this.addMutationAction({
        name: 'addMenuLinks',
        description: 'Add menu links',
        execute: this.addMenuLinks
      });
      this.setupMutationObserver();
    }).catch(error => {
      this.error('Error waiting for side menu:', error);
    });
  }

  private addMenuLinks = async (): Promise<void> => {
    this.log('Side menu found, creating alert buttons');
    
    // Get the sidemenu element
    const sidemenu = document.querySelector('[data-testid="data-testid navigation mega-menu"] ul[aria-label="Navigation"]') as HTMLElement;
    if (!sidemenu) {
      this.log('Side menu not found, skipping');
      return;
    }
    
    // Add separator if configured and not already present
    if (config.separator_text && !sidemenu.querySelector('[data-grafana-separator]')) {
      const separator = new SidebarSeparator(config.separator_text);
      sidemenu.appendChild(separator.getElement());
    }
 
    this.addAlertButtons(sidemenu);
    this.addStaticLinks(sidemenu);
  }

  private addAlertButtons(sidemenu: HTMLElement): void {
    const currentHost = window.location.host;
    const alertButtons = config?.alert_buttons || [];
    
    // Create all alert buttons (with badges) - filter by domain
    for (const buttonConfig of alertButtons) {
      if (!buttonConfig) continue;
      
      // Check if enabled
      if (!buttonConfig.enabled) {
        this.log(`Skipping alert button "${buttonConfig.name}" - disabled in config`);
        continue;
      }
      
      // Check domain filter
      if (!this.matchesDomain(buttonConfig.domain, currentHost)) {
        this.log(`Skipping alert button "${buttonConfig.name}" - domain mismatch (filter: ${buttonConfig.domain || 'none'}, current: ${currentHost})`);
        continue;
      }
      
      // Check if button already exists in DOM first (most reliable check)
      if (this.menuItemExists(buttonConfig.name, 'data-alert-button-name')) {
        this.log(`Alert button "${buttonConfig.name}" already exists in DOM, skipping`);
        // If it exists in DOM but not in our Map, that's fine - we just skip it
        continue;
      }
      
      // Check if button already exists in our Map and verify it's still in DOM
      if (this.buttons.has(buttonConfig.name)) {
        const existingButtonInstance = this.buttons.get(buttonConfig.name);
        if (existingButtonInstance) {
          const buttonElement = existingButtonInstance.getElement();
          if (buttonElement && document.body.contains(buttonElement)) {
            this.log(`Alert button "${buttonConfig.name}" already exists in Map and DOM, skipping`);
            continue;
          } else {
            // Button in Map but not in DOM - remove from Map and recreate
            this.log(`Alert button "${buttonConfig.name}" in Map but not in DOM, removing from Map`);
            existingButtonInstance.stopRefresh();
            this.buttons.delete(buttonConfig.name);
          }
        }
      }
      
      try {
        const alertButton = new AlertsButton(buttonConfig);
        sidemenu.appendChild(alertButton.getElement());
        
        this.log(`Alert button "${buttonConfig.name}" created successfully`);
        this.buttons.set(buttonConfig.name, alertButton);
        
        // Start badge refresh interval
        alertButton.startRefresh();
      } catch (error) {
        this.error(`Error creating alert button "${buttonConfig.name}":`, error);
      }
    }
  }

  private addStaticLinks(sidemenu: HTMLElement): void {
    const currentHost = window.location.host;
    const staticLinks = config?.static_links || [];
    
    // Create all static links (without badges) - filter by domain
    for (const linkConfig of staticLinks) {
      if (!linkConfig) continue;
      
      // Check if enabled
      if (!linkConfig.enabled) {
        this.log(`Skipping static link "${linkConfig.name}" - disabled in config`);
        continue;
      }
      
      // Check domain filter
      if (!this.matchesDomain(linkConfig.domain, currentHost)) {
        this.log(`Skipping static link "${linkConfig.name}" - domain mismatch (filter: ${linkConfig.domain || 'none'}, current: ${currentHost})`);
        continue;
      }
      
      // Check if link already exists in DOM first (most reliable check)
      if (this.menuItemExists(linkConfig.name, 'data-static-link-name')) {
        this.log(`Static link "${linkConfig.name}" already exists in DOM, skipping`);
        continue;
      }
      
      try {
        const { name, icon, href } = linkConfig;
        const menuLink = new GrafanaMenuLink({ name, icon, href });
        sidemenu.appendChild(menuLink.getElement());
        this.log(`Static link "${linkConfig.name}" created successfully`);
      } catch (error) {
        this.error(`Error creating static link "${linkConfig.name}":`, error);
      }
    }
  }

  public override cleanup(): void {
    // Stop all button refresh intervals
    this.buttons.forEach((button) => {
      button.stopRefresh();
    });
    this.buttons.clear();
    
    if (this.sidebarObserver) {
      this.sidebarObserver.disconnect();
    }
    if (this.reAddTimeout) {
      clearTimeout(this.reAddTimeout);
    }
    super.cleanup();
  }
}

// Export GrafanaAlertBadgeScript for use in other files
export { GrafanaAlertBadgeScript };

// Export helper functions for use by components
/**
 * Generate href for alert button from labels
 */
export function generateAlertButtonHref(buttonConfig: IAlertButton): string {
  const params: string[] = [];
  
  // Add has labels
  if (buttonConfig.labels.has) {
    for (const [key, value] of Object.entries(buttonConfig.labels.has)) {
      if (value === null || value === undefined) continue;
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      params.push(`${encodedKey}=${encodedValue}`);
    }
  }
  
  // Add dont_have labels
  if (buttonConfig.labels.dont_have) {
    for (const [key, value] of Object.entries(buttonConfig.labels.dont_have)) {
      if (value === null || value === undefined) continue;
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      params.push(`${encodedKey}!=${encodedValue}`);
    }
  }
  
  const labelFilter = params.join(',');
  return `/alerting/list?labelFilter=${labelFilter}`;
}
