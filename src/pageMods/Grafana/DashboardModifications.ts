// Grafana dashboard query copy button - adds copy buttons to query editor rows
import { PageScript } from '../PageScript';
import IDashboard from '../../interfaces/IDashboard';
import { config } from '../../utils/config';
import { Grafana } from './Grafana';
import { CustomTooltip } from './Components/CustomTooltip';

class GrafanaDashboardDashboardModifications extends PageScript {
  private cachedDashboard: IDashboard | null = null;
  private customTooltip: CustomTooltip | null = null;

  constructor() {
    // Match grafana.xip.se host and any URI
    super(
      /^grafana\.xip\.se$/,
      /^\/d\/.*$/ // match the dashboard uri
    );
  }

  protected override execute(): void {
    this.log('Executing Grafana page script');
    this.log(`Current URL: ${window.location.href}`);
    this.log(`Host: ${window.location.host}, Path: ${window.location.pathname}`);
    
    // Wait for the side menu to appear
    this.log('Waiting for side menu element...');
    this.waitForElement('[data-testid="data-testid Edit dashboard button"]').then(async (editButton: HTMLElement) => {
      this.log('Edit button found, modifying text');

      this.addMutationAction({
        name: 'modifyEditButton',
        description: 'Modify edit button',
        execute: this.modifyEditButton
      });
      this.addMutationAction({
        name: 'addParentDashboardButton',
        description: 'Add parent dashboard button',
        execute: this.addParentDashboardButton
      });
      this.setupMutationObserver();
    }).catch(error => {
      this.error('Error waiting for dashboard edit button:', error);
    });
  }

  private async fetchDashboard(): Promise<IDashboard | null> {
    // Return cached dashboard if available
    if (this.cachedDashboard !== null) {
      this.log('Using cached dashboard');
      return this.cachedDashboard;
    }

    try {
      const uid = window.location.pathname.split('/')[2];
      this.log(`Fetching dashboard with UID: ${uid}`);
      const dashboard = await Grafana.fetchDashboard(uid);
      if (dashboard) {
        this.cachedDashboard = dashboard;
        this.log('Dashboard fetched successfully');
        this.log(`Dashboard has templating: ${!!dashboard.dashboard?.templating}`);
        this.log(`Templating list length: ${dashboard.dashboard?.templating?.list?.length || 0}`);
      } else {
        this.error('Failed to fetch dashboard: Dashboard not found');
      }
      return dashboard;
    } catch (error) {
      this.error('Error fetching dashboard:', error);
      return null;
    } 
  }

  addParentDashboardButton = async (): Promise<void> => {
    this.log('addParentDashboardButton: Starting');
    
    const dashboard = await this.fetchDashboard();
    const editButton = document.querySelector('[data-testid="data-testid Edit dashboard button"]') as HTMLElement | null;
    
    this.log(`addParentDashboardButton: Dashboard fetched: ${!!dashboard}`);
    this.log(`addParentDashboardButton: Edit button found: ${!!editButton}`);
    
    if (!dashboard) {
      this.log('addParentDashboardButton: No dashboard, exiting');
      return;
    }
    
    if (!editButton) {
      this.log('addParentDashboardButton: No edit button found, exiting');
      return;
    }

    // Check if parent dashboard button already exists
    const existingButton = document.querySelector('[data-parent-dashboard-button="true"]');
    if (existingButton) {
      this.log('addParentDashboardButton: Parent dashboard button already exists, skipping');
      return;
    }

    // Find the parentdashboard variable in templating.list
    const templatingList = dashboard.dashboard?.templating?.list || [];
    this.log(`addParentDashboardButton: Templating list length: ${templatingList.length}`);
    this.log(`addParentDashboardButton: Templating list items:`, templatingList.map((item: any) => item.name));
    
    const parentDashboardVar = templatingList.find((item: any) => item.name === 'parentdashboard');
    this.log(`addParentDashboardButton: Parent dashboard variable found: ${!!parentDashboardVar}`);

    if (!parentDashboardVar) {
      this.log('addParentDashboardButton: No parentdashboard variable found in templating list, exiting');
      return;
    }

    this.log(`addParentDashboardButton: Parent dashboard variable:`, parentDashboardVar);

    // Get the URL from current.value or fallback to query
    const parentUrl = parentDashboardVar.current?.value || parentDashboardVar.query;
    this.log(`addParentDashboardButton: Parent URL from current.value: ${parentDashboardVar.current?.value}`);
    this.log(`addParentDashboardButton: Parent URL from query: ${parentDashboardVar.query}`);
    this.log(`addParentDashboardButton: Final parent URL: ${parentUrl}`);
    
    if (!parentUrl) {
      this.log('addParentDashboardButton: Parent dashboard variable found but no URL value available, exiting');
      return;
    }

    this.log(`addParentDashboardButton: Found parent dashboard variable with URL: ${parentUrl}`);

    // Get button text from config
    const buttonText = config.dashboard_edit_warnings?.parent_dashboard_button_text || 'Parent Dashboard';
    this.log(`addParentDashboardButton: Button text: ${buttonText}`);

    // Create the parent dashboard button similar to edit button structure
    this.log('addParentDashboardButton: Creating parent dashboard button');
    
    // Create the wrapper div with same classes as edit button
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'css-exd1zr';
    wrapperDiv.style.order = '3'; // Place before edit button (order: 4)
    wrapperDiv.style.visibility = 'visible';
    wrapperDiv.setAttribute('data-parent-dashboard-button', 'true');
    
    // Create the button with same classes as edit button
    const button = document.createElement('button');
    button.className = 'css-1tfu2jn-button';
    button.type = 'button';
    button.setAttribute('data-testid', 'data-testid Parent dashboard button');
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('tabindex', '0');
    button.style.backgroundColor = 'green';
    button.style.color = 'white';
    button.onclick = () => {
      window.location.href = parentUrl;
    };
    
    // Create the span with same class as edit button
    const span = document.createElement('span');
    span.className = 'css-1riaxdn';
    span.textContent = buttonText;
    
    button.appendChild(span);
    wrapperDiv.appendChild(button);
    
    this.log(`addParentDashboardButton: Button element created: ${!!wrapperDiv}`);

    // Find the parent div of the edit button and insert before it
    this.log('addParentDashboardButton: Finding edit button parent div');
    this.log(`addParentDashboardButton: Edit button tagName: ${editButton.tagName}`);
    this.log(`addParentDashboardButton: Edit button parentElement: ${editButton.parentElement?.tagName || 'null'}`);
    
    const editButtonParent = editButton.parentElement;
    
    if (editButtonParent && editButtonParent.parentElement) {
      // Insert the parent button before the edit button's parent div
      this.log(`addParentDashboardButton: Inserting button before parent div (${editButtonParent.tagName})`);
      editButtonParent.parentElement.insertBefore(wrapperDiv, editButtonParent);
      this.log('addParentDashboardButton: Parent dashboard button added successfully');
    } else {
      this.error('addParentDashboardButton: Could not find parent element to insert parent dashboard button');
      this.error(`addParentDashboardButton: Edit button parentElement: ${editButtonParent}`);
    }
  }

  modifyEditButton = async (): Promise<void> => {
    this.log('modifyEditButton: Starting');
    const tags = config.dashboard_edit_warnings?.tags || [];
    this.log(`modifyEditButton: Warning tags from config: ${tags.join(', ')}`);
    
    const editButton = document.querySelector('[data-testid="data-testid Edit dashboard button"]') as HTMLElement | null;
    this.log(`modifyEditButton: Edit button found: ${!!editButton}`);
    
    const dashboard = await this.fetchDashboard();
    this.log(`modifyEditButton: Dashboard fetched: ${!!dashboard}`);
    this.log(`modifyEditButton: Dashboard tags: ${dashboard?.dashboard?.tags?.join(', ') || 'none'}`);

    // check if dashboard has any of the tags
    const hasWarningTag = dashboard?.dashboard?.tags?.some(tag => tags.includes(tag));
    this.log(`modifyEditButton: Dashboard has warning tag: ${hasWarningTag}`);
    
    if (hasWarningTag) {
      if (editButton && editButton.style.backgroundColor !== 'red') {
        this.log('Edit button found, modifying color and tooltip');
        
        // Change the button styling
        editButton.style.backgroundColor = 'red';
        editButton.style.color = 'white';
        
        // Set custom tooltip message
        const warningMessage = config.dashboard_edit_warnings?.warning_message || 'Warning: This dashboard has restricted tags';
        
        // Create custom tooltip
        this.customTooltip = new CustomTooltip(editButton, warningMessage);
      }
    }

  }

  public override cleanup(): void {
    if (this.customTooltip) {
      this.customTooltip.cleanup();
      this.customTooltip = null;
    }
    super.cleanup();
  }

}

// Export GrafanaAlertBadgeScript for use in other files
export { GrafanaDashboardDashboardModifications };
