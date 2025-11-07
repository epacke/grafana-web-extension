import { PageScript } from "../PageScript";
import { config } from '../../utils/config';
import { Grafana } from './Grafana';
import { IAlertRule } from '../../interfaces/IAlert';
import { CustomTooltip } from './Components/CustomTooltip';

class GrafanaAlertingListModifications extends PageScript {
  private cachedFilteredRules: IAlertRule[] | null = null;
  private customTooltips: Map<HTMLElement, CustomTooltip> = new Map();
  private alertParentUidMap: Map<string, string> = new Map();

  constructor() {
    // Match grafana.xip.se host and any URI
    super(
      /^grafana\.xip\.se$/,
      /^\/alerting\/list.*/ // match the alerting list uri
    );
  }

  protected override async execute(): Promise<void> {
    this.log('Executing GrafanaAlertingListModifications page script');
    this.log(`Current URL: ${window.location.href}`);
    this.log(`Host: ${window.location.host}, Path: ${window.location.pathname}`);

    try {
      await this.fetchFilteredAlerts();
      this.buildParentUidMap();
    } catch (error) {
      this.error('Error fetching filtered alerts:', error);
      return; // Don't set up mutation observer if fetch failed
    }

    // Only set up mutation observer if fetch succeeded
    try {
    this.addMutationAction({
        name: 'modifyEditButtons',
        description: 'Modify alert edit buttons',
        execute: this.modifyEditButtons
      });
      this.setupMutationObserver();
    } catch (error) {
      this.error('Error setting up mutation observer:', error);
    }
  }

  private async fetchFilteredAlerts(): Promise<void> {
    // Return cached rules if available
    if (this.cachedFilteredRules !== null) {
      this.log('Using cached filtered alerts');
      this.log(`Cached alerts count: ${this.cachedFilteredRules.length}`);
      return;
    }

    const alertEditWarnings = config.alert_edit_warnings;
    this.log(`Alert edit warnings:`, alertEditWarnings);
    
    if (!alertEditWarnings) {
      this.log('Alert edit warnings is undefined - check config.yaml');
      return;
    }
    
    if (!alertEditWarnings.enabled || !alertEditWarnings.labels) {
      this.log('Alert edit warnings not enabled or no label filter configured');
      this.log(`Enabled: ${alertEditWarnings.enabled}, Labels: ${JSON.stringify(alertEditWarnings.labels)}`);
      return;
    }

    try {
      this.log('Fetching alerts with label filter');
      this.log(`Label filter:`, alertEditWarnings.labels);
      
      const rulesResponse = await Grafana.fetchRules();
      const filteredRules = Grafana.filterRulesByLabels(rulesResponse, alertEditWarnings.labels);
      
      this.cachedFilteredRules = filteredRules;
      this.log(`Found ${filteredRules.length} matching alert rules`);
      this.log(`Matching rule UIDs: ${filteredRules.map(rule => rule.uid).join(', ')}`);
    } catch (error) {
      this.error('Error fetching filtered alerts:', error);
    }
  }

  private buildParentUidMap(): void {
    this.alertParentUidMap.clear();
    
    if (!this.cachedFilteredRules) {
      return;
    }
    
    this.cachedFilteredRules.forEach(rule => {
      if (rule.labels && rule.labels['parent-uid']) {
        this.alertParentUidMap.set(rule.uid, rule.labels['parent-uid']);
        this.log(`Alert ${rule.uid} has parent-uid: ${rule.labels['parent-uid']}`);
      }
    });
  }

  modifyEditButtons = async (): Promise<void> => {
    this.log('modifyEditButtons: Starting');

    const filteredRules = await this.getFilteredAlerts();
    if (filteredRules.length === 0) {
      this.log('No matching alerts found, skipping button modification');
      return;
    }

    // Create a Set of alert rule UIDs for quick lookup
    const matchingRuleUids = new Set(filteredRules.map(rule => rule.uid));
    this.log(`Matching rule UIDs: ${Array.from(matchingRuleUids).join(', ')}`);

    // Find all edit buttons - they have href like /alerting/{uid}/edit
    const editButtons = document.querySelectorAll('a[href*="/alerting/"][href*="/edit"]') as NodeListOf<HTMLAnchorElement>;
    this.log(`Found ${editButtons.length} edit buttons`);

    editButtons.forEach((button) => {
      // Extract UID from href (format: /alerting/{uid}/edit)
      const hrefMatch = button.href.match(/\/alerting\/([^\/]+)\/edit/);
      if (!hrefMatch || !hrefMatch[1]) {
        this.log('No href match or no UID found');
        return;
      }

      const alertUid = hrefMatch[1];
      if (matchingRuleUids.has(alertUid)) {
        // Check if this button has already been modified (red or green)
        if ((button.style.backgroundColor === 'red' || button.style.backgroundColor === 'green') && this.customTooltips.has(button)) {
          return;
        }
        
        this.log(`Modifying edit button for alert UID: ${alertUid}`);
        
        // Check if alert has parent-uid
        const parentUid = this.alertParentUidMap.get(alertUid);
        let tooltipMessage: string;
        
        if (parentUid) {
          // Replace the button: make it green and point to parent
          button.style.backgroundColor = 'green';
          button.style.color = 'white';
          button.href = `/alerting/grafana/${parentUid}`;
          tooltipMessage = 'Ändra template';
          this.log(`Replaced Edit button href to point to parent alert ${parentUid}`);
        } else {
          // No parent: keep red color for warning
          button.style.backgroundColor = 'red';
          button.style.color = 'white';
          tooltipMessage = config.alert_edit_warnings?.warning_message || 'Warning: This alert has restricted labels';
        }
        
        // Create custom tooltip with appropriate message
        const customTooltip = new CustomTooltip(button, tooltipMessage);
        this.customTooltips.set(button, customTooltip);
      }
    });
  }


  private async getFilteredAlerts(): Promise<IAlertRule[]> {
    // Return cached rules if available
    if (this.cachedFilteredRules !== null) {
      return this.cachedFilteredRules;
    }

    // Trigger fetch if not cached
    await this.fetchFilteredAlerts();
    return this.cachedFilteredRules || [];
  }

  public override cleanup(): void {
    // Remove all custom tooltips
    this.customTooltips.forEach((tooltip) => {
      tooltip.cleanup();
    });
    this.customTooltips.clear();
    
    super.cleanup();
  }
}

export { GrafanaAlertingListModifications };
