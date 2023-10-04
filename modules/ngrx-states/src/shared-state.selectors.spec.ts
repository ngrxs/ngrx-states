import { SharedState } from './shared-state';
import { createSelectors } from './shared-state.selectors';

interface TestData {
  id: number;
  key: string;
}

type SharedStateTest = SharedState<TestData, number>;

describe('selectors', () => {
  const { selectLoaded, selectEntities, selectLoadState, selectSaveState, selectSelectedId } =
    createSelectors<SharedStateTest>('test');

  const testState = {
    test: {
      entities: { id: 5, key: 'data' },
      loaded: true,
      loading: { loading: false, error: 'Load error' },
      saving: { loading: false, error: 'Save error' },
      selectedId: 5
    } as SharedStateTest
  };

  it('selectEntities', () => {
    const data = selectEntities(testState);
    expect(data.id).toBe(5);
    expect(data.key).toBe('data');
  });

  it('selectLoaded', () => {
    const data = selectLoaded(testState);
    expect(data).toBeTruthy();
  });

  it('selectLoadState', () => {
    const data = selectLoadState(testState);
    expect(data.error).toBe('Load error');
  });

  it('selectSaveState', () => {
    const data = selectSaveState(testState);
    expect(data.error).toBe('Save error');
  });

  it('selectSelectedId', () => {
    const id = selectSelectedId(testState);
    expect(id).toBe(5);
  });
});
