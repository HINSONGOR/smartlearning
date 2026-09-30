/** 資料有改動時通知畫面重新讀取 */
export class ChangeNotifier {
  private listeners = new Set<() => void>();
  private version = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  };

  getVersion = () => this.version;

  notify() {
    this.version++;
    this.listeners.forEach((listener) => listener());
  }
}
