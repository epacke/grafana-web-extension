// Grafana dashboard query copy button - adds copy buttons to query editor rows
import { PageScript } from '../PageScript';
import { CopyQueryButton } from './Components/CopyQueryButton';
import IDashboard from '../../interfaces/IDashboard';

class GrafanaDashboardQueryCopyButton extends PageScript {

  constructor() {
    // Match grafana.xip.se host and any URI
    super(
      /^grafana\.xip\.se$/,
      /^\/d\/.+$/ // match the dashboard uri
    );
  }

  protected override execute(): void {
    this.log('Executing Grafana page script');
    this.log(`Current URL: ${window.location.href}`);
    this.log(`Host: ${window.location.host}, Path: ${window.location.pathname}`);
    
    // Wait for the side menu to appear
    this.log('Waiting for side menu element...');
    this.waitForElement('.query-editor-row').then(async (queryEditorRow: HTMLElement) => {
      this.log('Query row found, adding copy buttons');

      this.addMutationAction({
        name: 'copyQuery',
        description: 'Copy query',
        execute: this.addCopyQueryButton
      });
    
      this.addMutationAction({
        name: 'modifyEditButton',
        description: 'Modify edit button',
        execute: this.modifyEditButton
      });
      this.setupMutationObserver();
    }).catch(error => {
      this.error('Error waiting for side menu:', error);
    });
  }

  /**
   * Extracts variables from window.location.search that start with "var-"
   * Also calculates __interval and __rate_interval based on time range
   * @returns Map with variable names (without "var-" prefix) as keys and their values
   * 
   * Example:
   * Input: "?var-job=gargamel&var-node=10.150.0.2:9100&from=now-24h&to=now"
   * Output: Map([["job", "gargamel"], ["node", "10.150.0.2:9100"], ["__interval", "1m"], ["__rate_interval", "1m"]])
   */
  protected extractVariables(): Map<string, string> {
    const vars = new Map<string, string>();
    const search = window.location.search;
    
    if (!search) {
      this.warn('No query string found, defaulting interval to 1m');
      vars.set('__interval', '1m');
      vars.set('__rate_interval', '1m');
      return vars;
    }
    
    // Remove leading '?' if present
    const cleanQuery = search.startsWith('?') ? search.slice(1) : search;
    
    // Split by '&' to get individual parameters
    const params = cleanQuery.split('&');
    
    params.forEach(param => {
      const [key, value] = param.split('=');
      
      // Check if the key starts with "var-" and has a value
      if (key && key.startsWith('var-') && value !== undefined) {
        // Remove "var-" prefix and decode the value
        const varName = key.substring(4); // Remove "var-" prefix (4 characters)
        const decodedValue = decodeURIComponent(value);
        vars.set(varName, decodedValue);
      }
    });
    
    // Calculate interval based on time range
    const paramsObj = new URLSearchParams(search);
    const fromParam = paramsObj.get('from');
    const toParam = paramsObj.get('to');
    
    if (!fromParam || !toParam) {
      this.warn('Could not determine time range from query string (missing from/to params), defaulting interval to 1m');
      vars.set('__interval', '1m');
      vars.set('__rate_interval', '1m');
      return vars;
    }
    
    try {
      const fromTime = this.parseGrafanaTimeStamp(fromParam);
      const toTime = this.parseGrafanaTimeStamp(toParam);
      const timeRangeMs = Math.abs(toTime - fromTime);
      const timeRangeHours = timeRangeMs / (1000 * 60 * 60);
      
      // Determine interval based on time range
      let interval = '1m'; // default
      if (timeRangeHours < 24) {
        interval = '1m';
      } else if (timeRangeHours < 48) {
        interval = '10m';
      } else {
        interval = '1h';
      }
      
      vars.set('__interval', interval);
      vars.set('__rate_interval', interval);
    } catch (error) {
      this.warn('Error calculating interval from time range, defaulting to 1m:', error);
      vars.set('__interval', '1m');
      vars.set('__rate_interval', '1m');
    }
    
    return vars;
  }

  /**
   * Parses a Grafana time string into a timestamp
   * Supports:
   * - "now" - current time
   * - "now-24h", "now-2d", "now-7d", etc. - relative time (supports s, h, d, w, m, y units)
   * - ISO 8601 timestamps - "2025-11-05T15:16:17.645Z" or "2024-01-01T00:00:00Z"
   * @param timeStr - The time string to parse
   * @returns The timestamp in milliseconds
   */
  protected parseGrafanaTimeStamp(timeStr: string): number {
    const now = Date.now();
    
    if (timeStr === 'now') {
      return now;
    }
    
    // Try to parse as ISO 8601 timestamp first (e.g., "2025-11-05T15:16:17.645Z")
    const timestamp = Date.parse(timeStr);
    if (!isNaN(timestamp)) {
      return timestamp;
    }
    
    // Handle relative time like "now-24h", "now-2d", "now-7d"
    const relativeTimeMatch = timeStr.match(/now-(\d+)([hdwmys])/);
    if (relativeTimeMatch) {
      const value = parseInt(relativeTimeMatch[1], 10);
      const unit = relativeTimeMatch[2];
      
      let milliseconds = 0;
      switch (unit) {
        case 's': // seconds
          milliseconds = value * 1000;
          break;
        case 'h': // hours
          milliseconds = value * 60 * 60 * 1000;
          break;
        case 'd': // days
          milliseconds = value * 24 * 60 * 60 * 1000;
          break;
        case 'w': // weeks
          milliseconds = value * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'm': // months (approximate as 30 days)
          milliseconds = value * 30 * 24 * 60 * 60 * 1000;
          break;
        case 'y': // years (approximate as 365 days)
          milliseconds = value * 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          this.warn(`Unknown time unit '${unit}' in relative time string: ${timeStr}, defaulting to current time`);
          return now;
      }
      
      return now - milliseconds;
    }
    
    // Fallback to current time if parsing fails
    this.warn(`Could not parse time string: ${timeStr}, defaulting to current time`);
    return now;
  }

  /**
   * Normalizes whitespace in a string, replacing non-breaking spaces and other problematic characters
   * @param str - The string to normalize
   * @returns The normalized string
   */
  protected normalizeWhitespace(str: string): string {
    // Replace all non-standard Unicode whitespace characters with regular space
    // This includes: \u00a0 (non-breaking space), \u2000-\u200b, \u202f, \u205f, \u3000, etc.
    return str
      .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }

  /**
   * Replaces template variables in a query string with their values from the variables map
   * Supports both $var and ${var} syntax (with optional whitespace)
   * @param query - The query string to process
   * @param variables - Map of variable names to their values
   * @returns The query string with variables replaced
   * 
   * Example:
   * Input: "up{job=\"$job\"}", Map([["job", "gargamel"]])
   * Output: "up{job=\"gargamel\"}"
   */
  protected replaceVariables(query: string, variables: Map<string, string>): string {
    // Normalize whitespace first to remove non-breaking spaces
    let result = this.normalizeWhitespace(query);
    
    // Replace ${var} or ${ var } patterns (with optional whitespace)
    // Matches: ${var}, ${ var }, ${  var  }, etc.
    result = result.replace(/\$\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}/g, (match, varName) => {
      if (variables.has(varName)) {
        const value = variables.get(varName)!;
        // Normalize the replacement value as well
        return this.normalizeWhitespace(value);
      }
      return match; // Keep original if variable not found
    });
    
    // Replace $var patterns (but not already processed ${var} patterns)
    // Matches: $var (but not part of ${var})
    // We use a negative lookbehind to ensure we're not inside ${}
    result = result.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
      // Check if this is not part of a ${} pattern that we already processed
      // Since we processed ${} first, we can safely replace $var
      if (variables.has(varName)) {
        const value = variables.get(varName)!;
        // Normalize the replacement value as well
        return this.normalizeWhitespace(value);
      }
      return match; // Keep original if variable not found
    });
    
    return result;
  }

  addCopyQueryButton = (): void => {
    document.querySelectorAll('.query-editor-row').forEach(row => {
      // Find all buttons in the row and filter by text content
      const buttons = row.querySelectorAll('button');
      const runQueriesButton = Array.from(buttons).find(button => 
        button.textContent?.trim().includes('Run queries')
      );
      
      if (runQueriesButton) {
        // Check if copy button already exists to avoid duplicates
        const existingCopyButton = row.querySelector('.copy-query-button');
        if (existingCopyButton) {
          return; // Already exists, skip
        }
        
        const CopyButton = CopyQueryButton.createButton();

        CopyButton.addEventListener('click', () => {
          const variables = this.extractVariables();
          
          const queryElement = row.querySelector('div.view-line') as HTMLElement | null;
          // Use innerText first (only visible text, better whitespace handling)
          // Fallback to textContent if innerText is not available
          const query = queryElement?.innerText || queryElement?.textContent || '';
          this.log('query:', query);
          if (query) {
            const replacedQuery = this.replaceVariables(query, variables);
            this.log('replaced query:', replacedQuery);
            navigator.clipboard.writeText(replacedQuery);
          }
        });
        
        runQueriesButton.before(CopyButton);
      }
    });
  }
  private async fetchDashboard(): Promise<IDashboard | null> {
    let currentDashboardUid: string;
    
    try {
      // Get the dashboard uid from the url, ie /d/<uid>
      // Split on '/' gives: ['', 'd', '<uid>'], so index 2 is the UID
      const pathParts = window.location.pathname.split('/');
      currentDashboardUid = pathParts[2];
      
      if (!currentDashboardUid) {
        this.error('Could not extract dashboard UID from URL:', window.location.pathname);
        return null;
      }
    } catch (error) {
      this.error('Error determining dashboard UID:', error);
      return null;
    }
    
    try {
      // Grafana API endpoint: /api/dashboards/uid/{uid}
      const response = await fetch(`/api/dashboards/uid/${currentDashboardUid}`);
      if (!response.ok) {
        this.error('Failed to fetch dashboard:', response.statusText);
        return null;
      } 
      const data = await response.json();
      this.log('Dashboard fetched successfully:', data);
      return data;
    } catch (error) {
      this.error('Error fetching dashboard:', error);
      return null;
    }
  }

  modifyEditButton = async (): Promise<void> => {
    const dashboard = await this.fetchDashboard();
    if (!dashboard) {
      this.error('Failed to fetch dashboard');
      return;
    }
    this.log('Dashboard fetched successfully:', dashboard);
    const editButton = document.querySelector('[data-testid="data-testid Edit dashboard button"]') as HTMLElement | null;
    if (editButton && editButton.style.color !== 'red') {
      this.log('Edit button found, modifying text');
      // Change the text of the edit button to "Edit dashboard"
      editButton.textContent = 'Edit dashboard';
      editButton.addEventListener('click', () => {
        this.log('Edit button clicked');
      });
    }
  }

}

// Export GrafanaAlertBadgeScript for use in other files
export { GrafanaDashboardQueryCopyButton };
