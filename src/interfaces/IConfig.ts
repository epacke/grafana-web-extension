// Configuration interface matching config.yaml structure

export interface IAlertLabelFilter {
  has?: Record<string, any>;
  dont_have?: Record<string, any>;
}

export interface IAlertButton {
  name: string;
  enabled: boolean;
  type?: string;
  refresh_interval: number;
  icon: string;
  domain?: string; // Optional domain filter (exact match or wildcard like *.xip.se)
  labels: IAlertLabelFilter;
}

export interface IStaticLinkLabels {
  has: Record<string, any>;
  dont_have: Record<string, any>;
}

export interface IStaticLink {
  name: string;
  enabled: boolean;
  icon: string;
  domain?: string; // Optional domain filter (exact match or wildcard like *.xip.se)
  href: string; // Custom URL (if provided, labels are ignored)
}

export interface IDashboardEditWarnings {
  enabled: boolean;
  tags: string[];
  warning_message?: string; // Custom warning message for the tooltip
  parent_dashboard_button_text?: string; // Text for the parent dashboard button
}

export interface IAlertEditWarnings {
  enabled: boolean;
  warning_message?: string; // Custom warning message for the tooltip
  labels: IAlertLabelFilter; // Label filter to match alerts
}

export default interface IConfig {
  log_level?: 'debug' | 'info' | 'warn' | 'error';
  separator_text?: string;
  alert_buttons?: IAlertButton[];
  static_links?: IStaticLink[];
  dashboard_edit_warnings?: IDashboardEditWarnings;
  alert_edit_warnings?: IAlertEditWarnings;
}

