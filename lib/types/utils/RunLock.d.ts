export default class RunLock {
    private isLock;
    private callback;
    private status;
    constructor();
    init(): void;
    lock(): boolean;
    wait(): Promise<boolean>;
    unlock(): void;
}
