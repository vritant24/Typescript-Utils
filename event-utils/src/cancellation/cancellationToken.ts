/*---------------------------------------------------------------------------------------------
 *  The following code is taken from the https://github.com/microsoft/vscode/ repo and modified.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from "../disposable";
import { EmptyEvent } from "../events";
import { MutableToken, immediatelyInvokedEvent } from "./MutableToken";

export interface CancellationToken {
  /**
   * A flag signalling is cancellation has been requested.
   */
  readonly isCancellationRequested: boolean;

  /**
   * An event which fires when cancellation is requested. This event
   * only ever fires `once` as cancellation can only happen once. Listeners
   * that are registered after cancellation will be called (next event loop run),
   * but also only once.
   *
   * @event
   */
  readonly onCancellationRequested: (
    listener: (e: unknown) => unknown,
    thisArgs?: unknown,
    disposables?: IDisposable[]
  ) => IDisposable;
}

export function isCancellationToken(
  thing: unknown
): thing is CancellationToken {
  if (
    thing === EmptyCancellationToken ||
    thing === CancelledCancellationToken
  ) {
    return true;
  }
  if (thing instanceof MutableToken) {
    return true;
  }
  if (!thing || typeof thing !== "object") {
    return false;
  }
  return (
    typeof (thing as CancellationToken).isCancellationRequested === "boolean" &&
    typeof (thing as CancellationToken).onCancellationRequested === "function"
  );
}

export const EmptyCancellationToken = Object.freeze<CancellationToken>({
  isCancellationRequested: false,
  onCancellationRequested: EmptyEvent
});

export const CancelledCancellationToken = Object.freeze<CancellationToken>({
  isCancellationRequested: true,
  onCancellationRequested: immediatelyInvokedEvent
});
