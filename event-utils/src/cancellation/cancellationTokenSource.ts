/*---------------------------------------------------------------------------------------------
 *  The following code is taken from the https://github.com/microsoft/vscode/ repo and modified.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable } from "../disposable";
import {
  CancellationToken,
  CancelledCancellationToken,
  EmptyCancellationToken
} from "./cancellationToken";
import { MutableToken } from "./MutableToken";

export class CancellationTokenSource {
  private _token?: CancellationToken = undefined;
  private _parentListener?: IDisposable = undefined;

  constructor(parent?: CancellationToken) {
    this._parentListener =
      parent && parent.onCancellationRequested(this.cancel, this);
  }

  get token(): CancellationToken {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new MutableToken();
    }
    return this._token;
  }

  cancel(): void {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = CancelledCancellationToken;
    } else if (this._token instanceof MutableToken) {
      // actually cancel
      this._token.cancel();
    }
  }

  dispose(cancel = false): void {
    if (cancel) {
      this.cancel();
    }
    this._parentListener?.dispose();
    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = EmptyCancellationToken;
    } else if (this._token instanceof MutableToken) {
      // actually dispose
      this._token.dispose();
    }
  }
}
