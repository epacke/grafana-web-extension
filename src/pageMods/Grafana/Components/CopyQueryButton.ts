// Copy Query Button component - creates a styled copy button for Grafana query editor
class CopyQueryButton {
  public static createButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'copy-query-button';
    button.type = 'button';
    button.textContent = 'Copy query';
    
    button.style.cssText = `
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      color-scheme: dark;
      --sash-size: 4px;
      box-sizing: inherit;
      letter-spacing: 0.01071em;
      font: inherit;
      margin: 0px;
      appearance: button;
      touch-action: manipulation;
      display: inline-flex;
      -webkit-box-align: center;
      align-items: center;
      font-size: 12px;
      font-weight: 500;
      font-family: Inter, Helvetica, Arial, sans-serif;
      height: 24px;
      line-height: 22px;
      vertical-align: middle;
      cursor: pointer;
      color: rgb(204, 204, 220);
      gap: 8px;
      padding: 0px 7px;
      border-radius: 2px;
      background: rgba(204, 204, 220, 0.1);
      border-width: 1px;
      border-style: solid;
      border-color: rgba(204, 204, 220, 0.08);
      border-image: initial;
      transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1), color 250ms cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    return button;
  }
}

export { CopyQueryButton };

