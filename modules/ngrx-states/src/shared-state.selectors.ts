import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { LoadableState, SharedLoadableState, SharedState, SharedStateId } from './shared-state';

interface SharedLoadableStateSelectors<TState extends SharedLoadableState<TData>, TData> {
  selectEntities: MemoizedSelector<object, TData, (state: TState) => TData>;
  selectLoaded: MemoizedSelector<object, boolean, (state: TState) => boolean>;
  selectLoadState: MemoizedSelector<object, LoadableState, (state: TState) => LoadableState>;
}

interface SharedStateSelectors<
  TState extends SharedLoadableState<TData>,
  TData,
  TId extends SharedStateId
> extends SharedLoadableStateSelectors<TState, TData> {
  selectSaveState: MemoizedSelector<object, LoadableState, (state: TState) => LoadableState>;
  selectSelectedId: MemoizedSelector<object, TId, (state: TState) => TId>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSelectors<TState extends SharedState<any, any>>(
  featureName: string
): SharedStateSelectors<TState, TState['entities'], TState['selectedId']>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSelectors<TState extends SharedLoadableState<any>>(
  featureName: string
): SharedLoadableStateSelectors<TState, TState['entities']>;
export function createSelectors<TData, TState extends SharedState<TData, number>>(
  featureName: string
) {
  const selectSharedState = createFeatureSelector<TState>(featureName);

  return {
    selectEntities: createSelector(selectSharedState, (state) => state.entities),
    selectSaveState: createSelector(selectSharedState, (state) => state.saving),
    selectLoadState: createSelector(selectSharedState, (state) => state.loading),
    selectLoaded: createSelector(selectSharedState, (state) => state.loaded),
    selectSelectedId: createSelector(selectSharedState, (state) => state.selectedId)
  };
}
