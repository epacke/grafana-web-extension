// Alert badge component - creates styled alert badges with count and status
class AlertBadge {
  public static createStatusBadge(count: number, status: 'firing' | 'pending'): HTMLElement {
    // Determine styles based on status
    const isFiring = status === 'firing';
    const style = isFiring ? `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      box-sizing: inherit;
      display: inline-flex;
      padding: 1px 4px;
      border-radius: 2px;
      background: rgba(242, 73, 92, 0.15);
      border: 1px solid rgba(242, 73, 92, 0.25);
      color: rgb(204, 204, 220);
      font-weight: 400;
      gap: 4px;
      font-size: 0.857143rem;
      line-height: 1.5;
      -webkit-box-align: center;
      align-items: center;
    ` : `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      font-kerning: normal;
      color-scheme: dark;
      font-variant-ligatures: no-contextual;
      font-family: Inter, Helvetica, Arial, sans-serif;
      letter-spacing: 0.01071em;
      font-variant-numeric: initial;
      box-sizing: inherit;
      display: inline-flex;
      padding: 1px 4px;
      border-radius: 2px;
      background: rgba(255, 153, 0, 0.15);
      border: 1px solid rgba(255, 153, 0, 0.25);
      color: rgb(204, 204, 220);
      font-weight: 400;
      gap: 4px;
      font-size: 0.857143rem;
      line-height: 1.5;
      -webkit-box-align: center;
      align-items: center;
    `;
    
    // Create the outer wrapper with inline styles
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; align-items: center; gap: 4px;';
    
    // Create the status div
    const statusDiv = document.createElement('div');
    const statusInner = document.createElement('div');
    statusInner.style.cssText = style;
    statusInner.textContent = `${count} ${status}`;
    
    statusDiv.appendChild(statusInner);
    wrapper.appendChild(statusDiv);
    
    return wrapper;
  }
}

export { AlertBadge };
