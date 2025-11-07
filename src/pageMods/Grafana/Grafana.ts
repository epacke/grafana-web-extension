// Grafana API client for fetching alerts/rules and dashboards
import IDashboard from '../../interfaces/IDashboard';
import { IAlertLabelFilter } from '../../interfaces/IConfig';
import IAlert, { IAlertGroup, IAlertRule } from '../../interfaces/IAlert';

export interface AlertCounts {
  firing: number;
  pending: number;
  ok: number;
}

/**
 * Grafana API client class
 * Provides methods to fetch alerts/rules and dashboards from Grafana API
 */
export class Grafana {
  /**
   * Fetch rules from Grafana Prometheus rules API
   * @param endpoint Optional custom endpoint (defaults to /api/prometheus/grafana/api/v1/rules)
   * @returns Promise with rules response
   */
  static async fetchRules(endpoint: string = '/api/prometheus/grafana/api/v1/rules'): Promise<IAlert> {
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Grafana] Failed to fetch rules:', error);
      throw error;
    }
  }

  /**
   * Fetch rules from Grafana Ruler API
   * @returns Promise with rules response
   */
  static async fetchRulesFromRuler(): Promise<IAlert> {
    return this.fetchRules('/api/ruler/grafana/api/v1/rules');
  }

  /**
   * Filter rules based on label criteria
   * @param rulesResponse The rules response from fetchRules
   * @param labelFilter Label filter criteria (has and dont_have)
   * @returns Array of filtered rules
   */
  static filterRulesByLabels(
    rulesResponse: IAlert,
    labelFilter: IAlertLabelFilter
  ): IAlertRule[] {
    const { has: hasLabels, dont_have: dontHaveLabels } = labelFilter;
    const filteredRules: IAlertRule[] = [];

    if (!rulesResponse.data?.groups || !Array.isArray(rulesResponse.data.groups)) {
      return filteredRules;
    }

    rulesResponse.data.groups.forEach((group: IAlertGroup) => {
      if (!group.rules || !Array.isArray(group.rules)) {
        return;
      }

      group.rules.forEach((rule: IAlertRule) => {
        let matches = true;

        // Check hasLabels (must have all)
        if (hasLabels) {
          for (const [key, value] of Object.entries(hasLabels)) {
            // Handle boolean values in YAML (they come as booleans, not strings)
            if (typeof value === 'boolean') {
              if (rule.labels?.[key] !== String(value)) {
                matches = false;
                break;
              }
            } else if (rule.labels?.[key] !== value) {
              matches = false;
              break;
            }
          }
        }

        // Check dontHaveLabels (must not have any)
        if (matches && dontHaveLabels) {
          for (const [key, value] of Object.entries(dontHaveLabels)) {
            // Handle boolean values in YAML
            if (typeof value === 'boolean') {
              if (rule.labels?.[key] === String(value)) {
                matches = false;
                break;
              }
            } else if (rule.labels?.[key] === value) {
              matches = false;
              break;
            }
          }
        }

        if (matches) {
          filteredRules.push(rule);
        }
      });
    });

    return filteredRules;
  }

  /**
   * Count alerts by state from filtered rules
   * @param rules Array of filtered rules
   * @returns Alert counts by state
   */
  static countAlertsByState(rules: IAlertRule[]): AlertCounts {
    const counts: AlertCounts = { firing: 0, pending: 0, ok: 0 };

    rules.forEach((rule) => {
      const state = rule.state;
      if (state === 'firing') counts.firing++;
      else if (state === 'pending') counts.pending++;
      else if (state === 'normal') counts.ok++;
    });

    return counts;
  }

  /**
   * Fetch alerts with label filtering and return counts
   * Convenience method that combines fetchRules, filterRulesByLabels, and countAlertsByState
   * @param labelFilter Label filter criteria
   * @param endpoint Optional custom endpoint (defaults to /api/prometheus/grafana/api/v1/rules)
   * @returns Promise with alert counts
   */
  static async fetchAlertsWithCounts(
    labelFilter: IAlertLabelFilter,
    endpoint: string = '/api/prometheus/grafana/api/v1/rules'
  ): Promise<AlertCounts> {
    try {
      const rulesResponse = await this.fetchRules(endpoint);
      const filteredRules = this.filterRulesByLabels(rulesResponse, labelFilter);
      return this.countAlertsByState(filteredRules);
    } catch (error) {
      console.error('[Grafana] Failed to fetch alerts with counts:', error);
      return { firing: 0, pending: 0, ok: 0 };
    }
  }

  /**
   * Fetch dashboard by UID
   * @param uid Dashboard UID
   * @returns Promise with dashboard data or null if not found
   */
  static async fetchDashboard(uid: string): Promise<IDashboard | null> {
    try {
      const response = await fetch(`/api/dashboards/uid/${uid}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const dashboard = await response.json();
      return dashboard;
    } catch (error) {
      console.error('[Grafana] Failed to fetch dashboard:', error);
      throw error;
    }
  }

  /**
   * Fetch dashboard by UID from current page URL
   * Extracts UID from window.location.pathname (assumes format /d/{uid}/...)
   * @returns Promise with dashboard data or null if not found
   */
  static async fetchDashboardFromUrl(): Promise<IDashboard | null> {
    try {
      const uid = window.location.pathname.split('/')[2];
      if (!uid) {
        throw new Error('Could not extract dashboard UID from URL');
      }
      return await this.fetchDashboard(uid);
    } catch (error) {
      console.error('[Grafana] Failed to fetch dashboard from URL:', error);
      return null;
    }
  }
}

