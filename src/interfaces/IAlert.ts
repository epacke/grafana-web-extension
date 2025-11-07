// Grafana Alerting API Interface
// Represents the structure of a Grafana alerting API response

export interface IAlertInstance {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: 'Alerting' | 'Normal' | 'Pending' | 'NoData' | 'Error';
  activeAt: string;
  value: string;
}

export interface IAlertRuleTotals {
  alerting: number;
  normal?: number;
  pending?: number;
  nodata?: number;
  error?: number;
}

export interface IAlertRuleNotificationSettings {
  receiver: string;
  [key: string]: any;
}

export interface IAlertRule {
  state: 'firing' | 'pending' | 'normal' | 'inactive';
  name: string;
  query: string;
  queriedDatasourceUIDs: string[];
  duration: number;
  activeAt: string;
  alerts: IAlertInstance[];
  totals: IAlertRuleTotals;
  totalsFiltered: IAlertRuleTotals;
  uid: string;
  folderUid: string;
  health: string;
  type: string;
  lastEvaluation: string;
  evaluationTime: number;
  isPaused: boolean;
  notificationSettings: IAlertRuleNotificationSettings;
  labels?: Record<string, string>;
  [key: string]: any;
}

export interface IAlertGroupTotals {
  firing: number;
  pending?: number;
  normal?: number;
  inactive?: number;
}

export interface IAlertGroup {
  name: string;
  file: string;
  folderUid: string;
  rules: IAlertRule[];
  totals: IAlertGroupTotals;
  interval: number;
  lastEvaluation: string;
  evaluationTime: number;
  [key: string]: any;
}

export interface IAlertData {
  groups: IAlertGroup[];
  totals: IAlertGroupTotals;
}

export default interface IAlert {
  status: 'success' | 'error';
  data: IAlertData;
  [key: string]: any;
}

