/*---------------------------------------------------------------------------------------------
 *  The following code is taken from the https://github.com/microsoft/vscode/ repo and modified.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from "../disposable";
import { Event, Emitter } from "../events";
import { CancellationToken } from "./cancellationToken";

export class MutableToken implements CancellationToken {
  private _isCancelled: boolean;
  private _emitter?: Emitter<void>;

  constructor() {
    this._isCancelled = false;
    this._emitter = undefined;
  }

  public cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;

      this._emitter?.fire();
      this.dispose();
    }
  }

  get isCancellationRequested(): boolean {
    return this._isCancelled;
  }

  get onCancellationRequested(): Event<unknown> {
    if (this._isCancelled) {
      return immediatelyInvokedEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter<void>();
    }
    return this._emitter.event;
  }

  public dispose(): void {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = undefined;
    }
  }
}

/**
 * Creates an event that immediately calls the listener asyncronously.
 */
export const immediatelyInvokedEvent: Event<unknown> = Object.freeze(function (
  callback: (e: unknown) => unknown,
  context?: unknown
): IDisposable {
  const handle = setTimeout(callback.bind(context), 0);
  return {
    dispose() {
      clearTimeout(handle);
    }
  };
});
