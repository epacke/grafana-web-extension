// Rancher Alerts Button component - creates the Rancher alerts menu item in Grafana
import { IAlertButton } from '../../../interfaces/IConfig';
import { generateAlertButtonHref } from '../GrafanaSidebarModifications';
import { AlertBadge } from './AlertBadge';
import { Grafana, AlertCounts } from '../Grafana';

class AlertsButton {
  private element: HTMLElement;
  private buttonConfig: IAlertButton;
  private refreshIntervalId: number | null = null;

  constructor(buttonConfig: IAlertButton) {
    const { icon, name } = buttonConfig;
    this.buttonConfig = buttonConfig;
    
    // Generate href from labels
    const href = generateAlertButtonHref(buttonConfig);

    // Inject hover styles if not already present
    if (!document.getElementById('rancher-alerts-button-hover-styles')) {
      const style = document.createElement('style');
      style.id = 'rancher-alerts-button-hover-styles';
      style.textContent = `
        .rancher-alerts-menu-link:hover {
          color: rgb(204, 204, 220) !important;
        }
        .rancher-alerts-menu-link:hover > * {
          color: rgb(204, 204, 220) !important;
        }
        .rancher-alerts-menu-link:hover .rancher-alerts-icon {
          opacity: 1 !important;
        }
        .rancher-alerts-menu-link:hover .rancher-alerts-text {
          color: rgb(204, 204, 220) !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Create the menu item structure
    const menuItemWrapper = document.createElement('div');
    menuItemWrapper.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      color: rgb(204, 204, 220);
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      list-style-type: none;
      line-height: 1.57143;
      box-sizing: inherit;
      -webkit-box-align: center;
      align-items: center;
      display: flex;
      flex: 1 1 0%;
      height: 100%;
      min-width: 0px;
      margin-top: 12px;
    `;
    
    const menuItemInner = document.createElement('div');
    menuItemInner.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      color: rgb(204, 204, 220);
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      list-style-type: none;
      line-height: 1.57143;
      box-sizing: inherit;
      display: flex;
      -webkit-box-pack: justify;
      justify-content: space-between;
      width: 100%;
      height: 100%;
    `;

    const menuLink = document.createElement('a');
    menuLink.setAttribute('data-testid', 'data-testid Nav menu item');
    menuLink.setAttribute('data-alert-button-name', name);
    menuLink.className = 'rancher-alerts-menu-link';
    menuLink.href = href;
    menuLink.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      list-style-type: none;
      line-height: 1.57143;
      box-sizing: inherit;
      cursor: pointer;
      text-decoration: none;
      touch-action: manipulation;
      -webkit-box-align: center;
      align-items: center;
      color: rgba(204, 204, 220, 0.65);
      height: 100%;
      position: relative;
      width: 100%;
    `;
    
    const linkInner = document.createElement('div');
    linkInner.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      list-style-type: none;
      line-height: 1.57143;
      cursor: pointer;
      color: rgba(204, 204, 220, 0.65);
      box-sizing: inherit;
      -webkit-box-align: center;
      align-items: center;
      display: flex;
      gap: 0.5rem;
      height: 100%;
      width: 100%;
      -webkit-box-pack: justify;
      justify-content: space-between;
    `;
    
    // Create the wrapper div that contains both icon and text
    const iconTextWrapper = document.createElement('div');
    iconTextWrapper.className = 'css-1go40k3';
    
    // Add SVG icon first with filter to match text color (rgba(204, 204, 220, 0.65))
    const iconImg = document.createElement('img');
    iconImg.src = chrome.runtime.getURL(icon);
    iconImg.alt = name;
    iconImg.className = 'rancher-alerts-icon';
    iconImg.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      list-style-type: none;
      cursor: pointer;
      color: rgba(204, 204, 220, 0.65);
      height: 18px;
      box-sizing: inherit;
      display: inline-block;
      fill: currentcolor;
      flex-shrink: 0;
      line-height: 0;
      vertical-align: middle;
      width: 24px;
      filter: brightness(0) saturate(100%) invert(94%) sepia(2%) saturate(127%) hue-rotate(191deg) brightness(93%) contrast(86%);
      opacity: 0.65;
    `;
    
    const textSpan = document.createElement('span');
    textSpan.setAttribute('data-text-span', 'true');
    textSpan.className = 'rancher-alerts-text';
    textSpan.textContent = name;
    textSpan.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      color: rgba(204, 204, 220, 0.65);
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      line-height: 1.57143;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      box-sizing: inherit;
      margin: 0px;
      padding: 0px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    
    iconTextWrapper.appendChild(iconImg);
    iconTextWrapper.appendChild(textSpan);
    linkInner.appendChild(iconTextWrapper);
    menuLink.appendChild(linkInner);
    menuItemInner.appendChild(menuLink);
    menuItemWrapper.appendChild(menuItemInner);
    
    this.element = menuItemWrapper;
  }

  /**
   * Get the button element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Get the menu link element (the <a> tag) for badge updates
   */
  public getMenuLink(): HTMLElement | null {
    return this.element.querySelector('a.rancher-alerts-menu-link') as HTMLElement | null;
  }

  /**
   * Fetch alerts and return counts
   */
  private async fetchAlerts(): Promise<AlertCounts> {
    try {
      return await Grafana.fetchAlertsWithCounts(this.buttonConfig.labels);
    } catch (error) {
      console.error('[RancherAlertsButton] Failed to fetch alerts:', error);
      return { firing: 0, pending: 0, ok: 0 };
    }
  }

  /**
   * Update badges on the button
   */
  public async updateBadges(): Promise<void> {
    const menuLink = this.getMenuLink();
    if (!menuLink) {
      return;
    }

    const counts = await this.fetchAlerts();
    
    const existingBadges = menuLink.querySelectorAll('[data-alert-badge]');
    existingBadges.forEach(badge => badge.remove());
    
    if (counts.firing > 0 || counts.pending > 0) {
      const badgeContainer = document.createElement('div');
      badgeContainer.setAttribute('data-alert-badge', 'true');
      badgeContainer.style.cssText = 'margin-left: 8px; display: inline-flex; gap: 8px; vertical-align: middle;';
      
      if (counts.firing > 0) {
        const badge = AlertBadge.createStatusBadge(counts.firing, 'firing');
        badgeContainer.appendChild(badge);
      }
      
      if (counts.pending > 0) {
        const badge = AlertBadge.createStatusBadge(counts.pending, 'pending');
        badgeContainer.appendChild(badge);
      }
      
      // Append badges to the text span
      const textSpan = menuLink.querySelector('[data-text-span]');
      if (textSpan) {
        textSpan.appendChild(badgeContainer);
      }
    }
  }

  /**
   * Start the refresh interval for badge updates
   */
  public startRefresh(): void {
    // Stop any existing interval
    this.stopRefresh();
    
    // Update badges immediately
    this.updateBadges();
    
    // Set up refresh interval
    const refreshInterval = this.buttonConfig.refresh_interval || 30000;
    this.refreshIntervalId = window.setInterval(() => {
      this.updateBadges();
    }, refreshInterval);
  }

  /**
   * Stop the refresh interval
   */
  public stopRefresh(): void {
    if (this.refreshIntervalId !== null) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }
}

export { AlertsButton };
