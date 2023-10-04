export type SharedStateId = number | string | null;
type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
type SingleTypeMap<TObj, TKey extends keyof TObj> = (
  val: PropType<TObj, TKey>
) => PropType<TObj, TKey>;

export interface LoadableState {
  error: string | null;
  loading: boolean;
}

export const emptyLoadableState: LoadableState = {
  error: null,
  loading: false
};

export const loadingAndNoError: LoadableState = {
  error: null,
  loading: true
};

export interface SharedLoadableState<TData> {
  readonly entities: TData;
  readonly loading: LoadableState;
  readonly loaded: boolean;
}

export interface SharedState<TData, TId extends SharedStateId> extends SharedLoadableState<TData> {
  readonly selectedId: TId;
  readonly saving: LoadableState;
}

export interface SharedStateAdapter {
  getInitialState<TData, TId extends SharedStateId>(value: TData | null): SharedState<TData, TId>;
  getInitialState<TData, TId extends SharedStateId>(value?: TData): SharedState<TData, TId>;
  getInitialLoadableState<TData>(value: TData | null): SharedLoadableState<TData>;
  getInitialLoadableState<TData>(value?: TData): SharedLoadableState<TData>;
  select<T extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: T,
    selectedId: TId,
    extras: Partial<T>
  ): T;
  select<T extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: T,
    selectedId: TId
  ): T;
  select<Т extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: Т,
    selectedId: TId
  ): Т;
  loading<Т extends SharedLoadableState<TData>, TData>(state: Т, entities: TData): Т;
  loading<Т extends SharedLoadableState<TData>, TData>(
    state: Т,
    entities: TData,
    extras: Partial<Т>
  ): Т;
  loaded<T extends SharedLoadableState<TData>, TData>(state: T, entities: TData): T;
  loaded<T extends SharedLoadableState<TData>, TData>(
    state: T,
    entities: TData,
    extras: Partial<T>
  ): T;
  loadFail<T extends SharedLoadableState<unknown>>(state: T, error: string): T;
  saving<T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(state: T): T;
  saving<T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(
    state: T,
    extras: Partial<T>
  ): T;
  saved<T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(
    state: T,
    entities: TData
  ): T;
  saved<T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(
    state: T,
    entities: TData,
    extras: Partial<T>
  ): T;
  saveFail<T extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: T,
    error: string
  ): T;
  clear<T extends SharedState<unknown, TId>, TId extends SharedStateId>(state: T): T;
  set<T extends SharedLoadableState<TData>, TData, TKey extends keyof T>(
    state: T,
    key: TKey,
    fn: SingleTypeMap<T, TKey>
  ): T;
}

export const adapter: SharedStateAdapter = {
  getInitialState: <TData>(value: TData | null = null) => ({
    selectedId: null,
    entities: value,
    loading: emptyLoadableState,
    saving: emptyLoadableState,
    loaded: false
  }),
  getInitialLoadableState: <TData>(value: TData | null = null) => ({
    entities: value,
    loading: emptyLoadableState,
    loaded: false
  }),
  select: <T extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: T,
    selectedId: TId,
    extras: Partial<T> = {}
  ) => ({
    ...state,
    ...extras,
    selectedId
  }),
  loading: <Т extends SharedLoadableState<TData>, TData>(
    state: Т,
    entities: TData,
    extras: Partial<Т> = {}
  ) => ({
    ...state,
    loading: loadingAndNoError,
    entities,
    ...extras
  }),
  loaded: <T extends SharedLoadableState<TData>, TData>(
    state: T,
    entities: TData,
    extras: Partial<T> = {}
  ) => ({
    ...state,
    loading: emptyLoadableState,
    entities,
    loaded: true,
    ...extras
  }),
  loadFail: <T extends SharedLoadableState<unknown>>(state: T, error: string) => ({
    ...state,
    loading: { loading: false, error }
  }),
  saving: <T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(
    state: T,
    extras: Partial<T> = {}
  ) => ({
    ...state,
    saving: loadingAndNoError,
    ...extras
  }),
  saved: <T extends SharedState<TData, TId>, TData, TId extends SharedStateId>(
    state: TData,
    entities: TData,
    extras: Partial<T> = {}
  ) => ({
    ...state,
    saving: emptyLoadableState,
    entities,
    ...extras
  }),
  saveFail: <T extends SharedState<unknown, TId>, TId extends SharedStateId>(
    state: T,
    error: string
  ) => ({
    ...state,
    saving: { loading: false, error }
  }),
  clear: <T extends SharedState<unknown, TId>, TId extends SharedStateId>(state: T) => ({
    ...state,
    saving: emptyLoadableState,
    loading: emptyLoadableState
  }),
  set: <T extends SharedLoadableState<TData>, TData, TKey extends keyof T>(
    state: T,
    key: TKey,
    fn: SingleTypeMap<T, TKey>
  ) => ({
    ...state,
    [key]: fn(state[key])
  })
};
