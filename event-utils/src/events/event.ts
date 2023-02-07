/*---------------------------------------------------------------------------------------------
 *  The following code is adopted from the https://github.com/microsoft/vscode/ repo.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable, EmptyDisposable } from "../disposable";

/**
 * An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: unknown): IDisposable;
}

export const EmptyEvent: Event<unknown> = () => EmptyDisposable;
