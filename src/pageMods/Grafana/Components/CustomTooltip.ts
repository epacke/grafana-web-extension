/**
 * Custom tooltip component for Grafana UI elements
 * Creates a custom tooltip that appears below the target element on hover
 */
export class CustomTooltip {
  private tooltipElement: HTMLElement;
  private targetElement: HTMLElement;
  private showTooltipHandler: (e: MouseEvent) => void;
  private hideTooltipHandler: (e: MouseEvent) => void;

  /**
   * Creates a custom tooltip for the target element
   * @param targetElement The element to attach the tooltip to
   * @param message The tooltip message to display
   */
  constructor(targetElement: HTMLElement, message: string) {
    this.targetElement = targetElement;

    // Remove Grafana's default tooltip attributes
    const ariaDescribedBy = targetElement.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      targetElement.removeAttribute('aria-describedby');
    }

    if (targetElement.title) {
      targetElement.removeAttribute('title');
    }

    // Create the tooltip element
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.textContent = message;
    this.tooltipElement.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: rgb(204, 204, 220);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: Inter, Helvetica, Arial, sans-serif;
      white-space: normal;
      max-width: 400px;
      word-wrap: break-word;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(this.tooltipElement);

    // Create event handlers
    this.showTooltipHandler = (e: MouseEvent) => {
      // Block event propagation to prevent Grafana's default tooltip handlers
      e.stopPropagation();
      e.stopImmediatePropagation();

      const buttonRect = this.targetElement.getBoundingClientRect();
      this.tooltipElement.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      this.tooltipElement.style.top = `${buttonRect.bottom + 10}px`;
      this.tooltipElement.style.transform = 'translateX(-50%)';
      this.tooltipElement.style.opacity = '1';
    };

    this.hideTooltipHandler = (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.tooltipElement.style.opacity = '0';
    };

    // Add event listeners with capture phase to intercept before Grafana's handlers
    this.targetElement.addEventListener('mouseenter', this.showTooltipHandler, true);
    this.targetElement.addEventListener('mouseleave', this.hideTooltipHandler, true);
  }

  /**
   * Removes the tooltip and cleans up event listeners
   */
  public cleanup(): void {
    this.targetElement.removeEventListener('mouseenter', this.showTooltipHandler, true);
    this.targetElement.removeEventListener('mouseleave', this.hideTooltipHandler, true);
    if (this.tooltipElement.parentElement) {
      this.tooltipElement.remove();
    }
  }

  /**
   * Gets the tooltip element (for external management if needed)
   */
  public getElement(): HTMLElement {
    return this.tooltipElement;
  }
}

