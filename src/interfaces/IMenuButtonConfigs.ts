// Grafana Menu Link component - creates simple menu links in Grafana sidebar
interface IMenuButtonConfig {
    name: string;
    icon: string;
    href: string;
}

interface IAlertButtonConfig extends IMenuButtonConfig {
    state: string;
    count: number;
}

export { IMenuButtonConfig , IAlertButtonConfig };
