export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastEvent {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type Listener = (toast: ToastEvent) => void;
type DismissListener = (id: string) => void;

const listeners: Listener[] = [];
const dismissListeners: DismissListener[] = [];

export const toast = {
  show(type: ToastType, message: string, duration = 3500) {
    const event: ToastEvent = {
      id: Math.random().toString(36).slice(2),
      type,
      message,
      duration,
    };
    listeners.forEach((fn) => fn(event));
  },
  success(message: string, duration?: number) {
    this.show("success", message, duration);
  },
  error(message: string, duration?: number) {
    this.show("error", message, duration ?? 5000);
  },
  warning(message: string, duration?: number) {
    this.show("warning", message, duration);
  },
  info(message: string, duration?: number) {
    this.show("info", message, duration);
  },
  dismiss(id: string) {
    dismissListeners.forEach((fn) => fn(id));
  },
  _subscribe(fn: Listener) {
    listeners.push(fn);
    return () => listeners.splice(listeners.indexOf(fn), 1);
  },
  _onDismiss(fn: DismissListener) {
    dismissListeners.push(fn);
    return () => dismissListeners.splice(dismissListeners.indexOf(fn), 1);
  },
};
