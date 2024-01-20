export default class RunLock {
  private isLock: boolean;
  private callback: null | Function;
  private status: Promise<boolean>;
  constructor() {
    this.init();
  }
  init() {
    this.isLock = false;
    this.callback = null;
    this.status = Promise.resolve(true);
  }
  lock() {
    if (this.isLock) {
      return false;
    }
    this.isLock = true;
    this.status = new Promise((resolve) => (this.callback = resolve));
    return true;
  }
  wait() {
    return this.status;
  }
  unlock() {
    typeof this.callback === 'function' && this.callback(true);
    this.init();
  }
}
