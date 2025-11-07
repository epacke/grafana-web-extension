// Sidebar Separator component - creates a separator with text in the Grafana sidebar
class SidebarSeparator {
  private element: HTMLElement;

  constructor(title: string) {
    // Create a container for the hr separator
    const separatorWrapper = document.createElement('div');
    separatorWrapper.setAttribute('data-grafana-separator', 'true');
    separatorWrapper.style.cssText = `
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
      margin-top: 16px;
      margin-bottom: 0px;
    `;
    
    // Create a flex container that holds the line, text, and line
    const separatorContainer = document.createElement('div');
    separatorContainer.style.cssText = `
      display: flex;
      align-items: center;
      width: 100%;
    `;
    
    // Create left line
    const leftLine = document.createElement('div');
    leftLine.style.cssText = `
      flex: 1;
      height: 1px;
      background: rgba(204, 204, 220, 0.2);
    `;
    
    // Create the text span
    const textSpan = document.createElement('span');
    textSpan.textContent = title;
    textSpan.style.cssText = `
      padding: 0 12px;
      color: rgba(204, 204, 220, 0.65);
      font-size: 1rem;
      font-weight: 500;
      font-family: Inter, Helvetica, Arial, sans-serif;
      white-space: nowrap;
    `;
    
    // Create right line
    const rightLine = document.createElement('div');
    rightLine.style.cssText = `
      flex: 1;
      height: 1px;
      background: rgba(204, 204, 220, 0.2);
    `;
    
    separatorContainer.appendChild(leftLine);
    separatorContainer.appendChild(textSpan);
    separatorContainer.appendChild(rightLine);
    separatorWrapper.appendChild(separatorContainer);
    
    this.element = separatorWrapper;
  }

  /**
   * Get the separator element
   */
  public getElement(): HTMLElement {
    return this.element;
  }
}

export { SidebarSeparator };

