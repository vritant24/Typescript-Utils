import { IDisposable } from "event-utils";

type WrappedAsyncAction = () => Thenable<void>;
type AsyncAction = () => Thenable<unknown>;
type ErrorHandler = (e: unknown) => void;

export const DisposedError = Object.freeze(
  new Error("The async action pump has been disposed")
);

const InvalidErrorHandlerString = "Provided error handler threw exception: ";

export class AsyncActionPump implements IDisposable {
  private readonly _errorHandler: ErrorHandler;
  private _queue: WrappedAsyncAction[];
  private _isActionRunning: boolean;
  private _isDisposed: boolean;

  constructor(errorHandler: ErrorHandler) {
    this._queue = [];
    this._isActionRunning = false;
    this._isDisposed = false;
    this._errorHandler = (e) => {
      try {
        errorHandler(e);
      } catch (e) {
        console.error(InvalidErrorHandlerString + e);
      }
    };
  }

  public post(action: AsyncAction): void {
    if (this._isDisposed) {
      throw DisposedError;
    }

    this._queue.push(
      () =>
        new Promise((resolve, reject) =>
          action().then(
            () => resolve(),
            (reason: unknown) => reject(reason)
          )
        )
    );
    this.dequeue();
  }

  public async waitForAllActions(): Promise<void> {
    if (this._isDisposed) {
      throw DisposedError;
    }

    let resolveCompletionPromise: () => void;

    const completionPromise: Promise<void> = new Promise((resolve) => {
      resolveCompletionPromise = resolve;
    });

    this.post(
      () =>
        new Promise<void>((resolve) => {
          resolveCompletionPromise();
          resolve();
        })
    );

    await completionPromise;
  }

  private dequeue(): void {
    if (this._isActionRunning || this._isDisposed) {
      return;
    }

    const nextAction = this._queue.shift();

    if (!nextAction) {
      // The queue is empty.
      return;
    }

    try {
      this._isActionRunning = true;
      nextAction().then(
        () => {
          this._isActionRunning = false;
          this.dequeue();
        },
        (e) => {
          this._isActionRunning = false;
          this.dequeue();
          this._errorHandler(e);
        }
      );
    } catch (e) {
      // If we arrive here, there is an error
      // in the wrapping logic in enqueue.
      this._isActionRunning = false;
      this.dequeue();
      this._errorHandler(e);
    }
  }

  dispose(): void {
    this._isDisposed = true;
    this._queue.length = 0;
  }
}
