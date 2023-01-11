// source: https://basarat.gitbook.io/typescript/main-1/typed-event

export interface Listener<T> {
  (event: T): any
}

export interface Disposable {
  dispose(): void
}

export class Event<T> {
  private listeners: Listener<T>[] = []
  private oneShotListeners: Listener<T>[] = []

  on(listener: Listener<T>): Disposable {
    this.listeners.push(listener)
    return {
      dispose: () => this.off(listener),
    }
  }

  once(listener: Listener<T>): void {
    this.oneShotListeners.push(listener)
  }

  off(listener: Listener<T>) {
    const callbackIndex = this.listeners.indexOf(listener)
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1)
  }

  emit(event: T) {
    /** Update any general listeners */
    this.listeners.forEach((listener) => listener(event))

    /** Clear the `once` queue */
    if (this.oneShotListeners.length > 0) {
      const toCall = this.oneShotListeners
      this.oneShotListeners = []
      toCall.forEach((listener) => listener(event))
    }
  }

  pipe(event: Event<T>): Disposable {
    return this.on((e) => event.emit(e))
  }
}
