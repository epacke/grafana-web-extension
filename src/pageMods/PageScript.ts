// Base class for page-specific script handlers
import { Logger, getLogLevel } from '../utils/Logger';
import IAction from '../interfaces/IAction';

class PageScript {
  protected hostRegex: RegExp;
  protected uriRegex: RegExp;
  protected logger: Logger;
  protected mutationActions: IAction[] = [];
  private mutationObserver: MutationObserver | null = null;
  private debounceTimeout: number | null = null;

  constructor(hostRegex: RegExp, uriRegex: RegExp) {
    this.hostRegex = hostRegex;
    this.uriRegex = uriRegex;
    // Use configured log level
    const logLevel = getLogLevel();
    this.logger = new Logger({
      prefix: this.constructor.name,
      level: logLevel
    });
  }

  // Check if current page matches this script's criteria
  public matches(): boolean {
    try {
      const url = new URL(window.location.href);
      const hostMatch = this.hostRegex.test(url.host);
      const pathMatch = this.uriRegex.test(url.pathname);
      const result = hostMatch && pathMatch;
      
      this.logger.debug('matches() check', {
        host: url.host,
        path: url.pathname,
        hostRegex: this.hostRegex.toString(),
        uriRegex: this.uriRegex.toString(),
        hostMatch,
        pathMatch,
        result
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error in matches()', error);
      return false;
    }
  }

  // Initialize the script for this page
  public initialize(): void {
    this.logger.debug(`initialize() called, document.readyState: ${document.readyState}`);
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      this.logger.debug('DOM still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        this.logger.debug('DOMContentLoaded fired, executing script');
        const result = this.execute();
        if (result instanceof Promise) {
          result.catch((error: any) => {
            this.logger.error('Error in execute():', error);
          });
        }
      });
    } else {
      this.logger.debug('DOM already ready, executing immediately');
      const result = this.execute();
      if (result instanceof Promise) {
        result.catch((error: any) => {
          this.logger.error('Error in execute():', error);
        });
      }
    }
  }

  // Method to be implemented by subclasses
  protected execute(): void | Promise<void> {
    // Override in subclasses
    throw new Error('execute() must be implemented by subclasses');
  }

  // Helper method to wait for an element (async/await style)
  protected waitForElement(selector: string): Promise<HTMLElement> {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return Promise.resolve(element);
    }

    return new Promise<HTMLElement>((resolve) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Observer manages itself - disconnects when element is found
      // No need to track it for cleanup
    });
  }

  // Helper method to create elements
  protected createElement(tag: string, attributes: Record<string, string> = {}, textContent: string = ''): HTMLElement {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style') {
        element.style.cssText = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }

  // Add an action to be executed on page mutations
  protected addMutationAction(action: IAction): void {
    this.mutationActions.push(action);
    this.logger.debug(`Added mutation action: ${action.name}`);
  }

  // Setup the mutation observer to execute actions when page changes
  protected setupMutationObserver(): void {
    // Disconnect existing observer if any
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Clear existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    // Don't setup observer if no actions
    if (this.mutationActions.length === 0) {
      this.logger.debug('No mutation actions registered, skipping observer setup');
      return;
    }
    
    this.mutationObserver = new MutationObserver(() => {
      // Debounce to avoid checking on every mutation - wait 100ms after last change
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = window.setTimeout(() => {
        this.logger.debug(`Executing ${this.mutationActions.length} mutation actions`);
        this.mutationActions.forEach(action => {
          try {
            this.logger.debug(`Executing action ${action.name}`);
            action.execute();
          } catch (error) {
            this.logger.error(`Error executing action ${action.name}:`, error);
          }
        });
      }, 100);
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.logger.debug('Mutation observer setup complete');
  }

  // Logging helpers (delegating to logger instance)
  protected log(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  protected error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  protected debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  protected warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  // Cleanup observers
  public cleanup(): void {
    // Clean up the persistent MutationObserver from setupMutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Clear the debounce timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    // Clear mutation actions
    this.mutationActions = [];
    
    // Note: waitForElement observers are temporary and disconnect themselves
    // when they find their target element, so no cleanup needed
    
    this.logger.debug('Cleanup complete');
  }
}

// Export PageScript class for use in other files
export { PageScript };
