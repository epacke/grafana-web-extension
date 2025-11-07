// Grafana Dashboard Interface
// Represents the structure of a Grafana dashboard JSON response

export interface IDashboardMeta {
  type: string;
  canSave: boolean;
  canEdit: boolean;
  canAdmin: boolean;
  canStar: boolean;
  canDelete: boolean;
  slug: string;
  url: string;
  expires: string;
  created: string;
  updated: string;
  updatedBy: string;
  createdBy: string;
  version: number;
  hasAcl: boolean;
  isFolder: boolean;
  apiVersion: string;
  folderId: number;
  folderUid: string;
  folderTitle: string;
  folderUrl: string;
  provisioned: boolean;
  provisionedExternalId: string;
  annotationsPermissions: {
    dashboard: {
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
    };
    organization: {
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
    };
  };
}

export interface IDashboardLink {
  icon?: string;
  tags?: string[];
  targetBlank?: boolean;
  title: string;
  type: string;
  url: string;
}

export interface IDashboardAnnotation {
  builtIn?: number;
  datasource?: {
    type: string;
    uid: string;
  };
  enable: boolean;
  hide: boolean;
  iconColor?: string;
  name: string;
  target?: {
    limit?: number;
    matchAny?: boolean;
    tags?: string[];
    type: string;
  };
  type: string;
}

export interface IPanelTarget {
  editorMode?: string;
  exemplar?: boolean;
  expr: string;
  format?: string;
  instant?: boolean;
  legendFormat?: string;
  range?: boolean;
  refId: string;
  step?: number;
  interval?: string;
}

export interface IPanelDatasource {
  type: string;
  uid: string;
}

export interface IThresholdStep {
  color: string;
  value?: number | null;
}

export interface IThresholds {
  mode: string;
  steps: IThresholdStep[];
}

export interface IMapping {
  type: string;
  options: {
    match?: string;
    result?: {
      text?: string;
      value?: string;
    };
  };
}

export interface IFieldConfigDefaults {
  color?: {
    mode: string;
    fixedColor?: string;
  };
  decimals?: number;
  links?: any[];
  mappings?: IMapping[];
  max?: number;
  min?: number;
  thresholds?: IThresholds;
  unit?: string;
  custom?: {
    [key: string]: any;
  };
}

export interface IFieldConfigOverride {
  matcher: {
    id: string;
    options: string;
  };
  properties: Array<{
    id: string;
    value?: any;
  }>;
}

export interface IFieldConfig {
  defaults: IFieldConfigDefaults;
  overrides?: IFieldConfigOverride[];
}

export interface IPanelGridPos {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface IPanelOptions {
  [key: string]: any;
}

export interface IPanel {
  id: number;
  type: string;
  title?: string;
  description?: string;
  gridPos: IPanelGridPos;
  targets?: IPanelTarget[];
  datasource?: IPanelDatasource;
  fieldConfig?: IFieldConfig;
  options?: IPanelOptions;
  collapsed?: boolean;
  panels?: IPanel[];
  pluginVersion?: string;
  maxDataPoints?: number;
}

export interface IDashboardData {
  annotations?: {
    list: IDashboardAnnotation[];
  };
  editable?: boolean;
  fiscalYearStartMonth?: number;
  graphTooltip?: number;
  id?: number;
  links?: IDashboardLink[];
  panels: IPanel[];
  refresh?: string;
  schemaVersion?: number;
  style?: string;
  tags?: string[];
  templating?: {
    list?: any[];
  };
  time?: {
    from: string;
    to: string;
  };
  timepicker?: any;
  timezone?: string;
  title?: string;
  uid?: string;
  version?: number;
  weekStart?: string;
}

export default interface IDashboard {
  meta: IDashboardMeta;
  dashboard: IDashboardData;
}

