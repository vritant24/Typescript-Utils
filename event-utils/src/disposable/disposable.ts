export interface IDisposable {
  dispose(): void;
}

/**
 * A disposable that does nothing when it is disposed of.
 **/
export const EmptyDisposable = Object.freeze<IDisposable>({
  dispose() {
    return;
  }
});
