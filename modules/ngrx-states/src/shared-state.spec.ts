import { emptyLoadableState, adapter, SharedState } from './shared-state';

type TestState = SharedState<{ id: number; key: string }[], number>;
const createSharedTestState = (): TestState =>
  adapter.getInitialState([
    { id: 1, key: 'A' },
    { id: 2, key: 'B' },
    { id: 3, key: 'C' }
  ]);

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

  it('adapter should create array setter', () => {
    const defaultLoadableState = createSharedTestState();

    const selector = adapter.createArraySetter<TestState>(({ id }) => id);
    expect(selector(defaultLoadableState, { id: 2, key: 'D' })).toEqual([
      { id: 1, key: 'A' },
      { id: 3, key: 'C' },
      { id: 2, key: 'D' }
    ]);
  });

  it('adapter should select', () => {
    const defaultLoadableState = createSharedTestState();

    const newState = adapter.select(defaultLoadableState, 2 as number);
    expect(newState.selectedId).toBe(2);
    expect(newState.entities).toBe(defaultLoadableState.entities);
  });

  it('adapter should set loading', () => {
    const defaultLoadableState = createSharedTestState();

    const newState = adapter.loading(defaultLoadableState, defaultLoadableState.entities);
    expect(newState.loaded).toBe(false);
    expect(newState.loading.loading).toBe(true);
  });

  it('adapter should set saving', () => {
    const defaultLoadableState = createSharedTestState();
    const newState = adapter.saving(defaultLoadableState);
    expect(newState.saving.loading).toBe(true);
  });
});
