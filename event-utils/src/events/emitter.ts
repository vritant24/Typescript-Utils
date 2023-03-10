/*---------------------------------------------------------------------------------------------
 *  The following code is adopted from the https://github.com/microsoft/vscode/ repo.
 *--------------------------------------------------------------------------------------------*/

import { LinkedList } from "../collections/linkedList";
import { IDisposable } from "../disposable";
import { Event } from "./event";

export class Emitter<T> {
  private _disposed = false;
  private _event?: Event<T>;
  private _deliveryQueue?: EventDeliveryQueue;
  protected _listeners?: LinkedList<Listener<T>>;

  dispose() {
    if (!this._disposed) {
      this._disposed = true;

      if (this._listeners) {
        this._listeners.clear();
      }

      this._deliveryQueue?.dispose();
    }
  }

  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event(): Event<T> {
    if (!this._event) {
      this._event = (
        callback: (e: T) => any,
        thisArgs?: unknown,
        disposables?: IDisposable[]
      ) => {
        ``;
        if (!this._listeners) {
          this._listeners = new LinkedList();
        }

        const listener = new Listener(callback, thisArgs, () => {
          if (!this._disposed) {
            removeListener();
          }
        });
        const removeListener = this._listeners.push(listener);

        if (disposables) {
          disposables.push(listener);
        }

        return listener;
      };
    }
    return this._event;
  }

  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event: T): void {
    if (this._listeners && this.hasListeners()) {
      // put all [listener,event]-pairs into delivery queue
      // then emit all event. an inner/nested event might be
      // the driver of this

      if (!this._deliveryQueue) {
        this._deliveryQueue = new EventDeliveryQueue();
      }

      for (const listener of this._listeners) {
        this._deliveryQueue.push(listener, event);
      }

      this._deliveryQueue.deliver();
    }
  }

  hasListeners(): boolean {
    if (!this._listeners) {
      return false;
    }
    return !this._listeners.isEmpty();
  }
}

class Listener<T> implements IDisposable {
  private isDisposed = false;

  constructor(
    readonly callback: (e: T) => void,
    readonly callbackThis: unknown | undefined,
    readonly disposeCall: () => void
  ) {}

  invoke(e: T) {
    this.callback.call(this.callbackThis, e);
  }

  dispose() {
    if (!this.isDisposed) {
      this.disposeCall();
      this.isDisposed = true;
    }
    return;
  }
}

export class EventDeliveryQueue implements IDisposable {
  protected _queue = new LinkedList<EventDeliveryQueueElement>();

  get size(): number {
    return this._queue.size;
  }

  push<T>(listener: Listener<T>, event: T): void {
    this._queue.push(new EventDeliveryQueueElement(listener, event));
  }

  clear(): void {
    this._queue.clear();
  }

  deliver(): void {
    while (this._queue.size > 0) {
      const element = this._queue.shift();
      if (element) {
        try {
          element.listener.invoke(element.event);
        } catch (e) {
          throw new Error("uh oh");
        }
      } else {
        throw new Error("uh oh");
      }
    }
  }

  dispose(): void {
    this.clear();
  }
}

class EventDeliveryQueueElement<T = any> {
  constructor(readonly listener: Listener<T>, readonly event: T) {}
}
