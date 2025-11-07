import { IMenuButtonConfig } from '../../../interfaces/IMenuButtonConfigs';

class GrafanaMenuButton {
  private element: HTMLElement;

  constructor(linkConfig: IMenuButtonConfig) {

    // Generate href from config (handles custom href or generates from labels)
    const { href, name, icon } = linkConfig;

    // Inject hover styles if not already present
    if (!document.getElementById('grafana-menu-link-hover-styles')) {
      const style = document.createElement('style');
      style.id = 'grafana-menu-link-hover-styles';
      style.textContent = `
        .grafana-menu-link:hover {
          color: rgb(204, 204, 220) !important;
        }
        .grafana-menu-link:hover > * {
          color: rgb(204, 204, 220) !important;
        }
        .grafana-menu-link:hover .grafana-menu-icon {
          opacity: 1 !important;
        }
        .grafana-menu-link:hover .grafana-menu-text {
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
    menuLink.setAttribute('data-static-link-name', name);
    menuLink.className = 'grafana-menu-link';
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
    iconImg.src = chrome.runtime.getURL(linkConfig.icon);
    iconImg.alt = linkConfig.name;
    iconImg.className = 'grafana-menu-icon';
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
    textSpan.className = 'grafana-menu-text';
    textSpan.textContent = linkConfig.name;
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
   * Get the menu link element
   */
  public getElement(): HTMLElement {
    return this.element;
  }
}

export { GrafanaMenuButton as GrafanaMenuLink };
