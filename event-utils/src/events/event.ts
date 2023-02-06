/*---------------------------------------------------------------------------------------------
 *  The following code is taken from the https://github.com/microsoft/vscode/ repo and modified.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable, EmptyDisposable } from "../disposable";

/**
 * An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: unknown): IDisposable;
}

export const EmptyEvent: Event<unknown> = () => EmptyDisposable;
