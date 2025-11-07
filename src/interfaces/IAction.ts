export default interface IAction {
    name: string;
    description?: string;
    execute(): void;
}