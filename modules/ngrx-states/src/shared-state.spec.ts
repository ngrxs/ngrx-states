import { emptyLoadableState, adapter } from './shared-state';

describe('shared-state', () => {
  it('empty', () => {
    expect(emptyLoadableState.error).toBeNull();
    expect(emptyLoadableState.loading).toBeFalsy();
  });

  it('adapter loadable default init', () => {
    const defaultLoadableState = adapter.getInitialLoadableState<number>();
    expect(defaultLoadableState.loading).toBe(emptyLoadableState);
    expect(defaultLoadableState.loaded).toBeFalsy();
    expect(defaultLoadableState.entities).toBeNull();
  });

  it('adapter loadable init', () => {
    const defaultLoadableState = adapter.getInitialLoadableState(5);
    expect(defaultLoadableState.loading).toBe(emptyLoadableState);
    expect(defaultLoadableState.loaded).toBeFalsy();
    expect(defaultLoadableState.entities).toBe(5);
  });
});
