# @ngrxs/states

`@ngrxs/states` library that provide a common state objects that include selecting, loading and saving metadata.

## Installation

![npm peer dependency @ngrx/store version](https://img.shields.io/npm/dependency-version/@ngrxs/states/peer/@ngrx/store)

1.  ```
    npm install --save @ngrxs/states
    ```

3.  Import and use `SharedState` in a state:

    ```typescript

    import { SharedState, adapter } from '@ngrxs/states';

    export type UsersState = SharedState<Users[], number>;
    export const initialState: UsersState = adapter.getInitialState<User[], number>([]);

    ```

## Usage

`@ngrxs/states` provides shared state to hold loaded, loading, saving information and selectors for it.

```typescript
// filename: users.reducer.ts

import { adapter, SharedState } from '@ngrxs/states';
import { createReducer, on } from '@ngrx/store';

import * as actions from './users.actions';
import { User } from '../models/user';

export type UsersState = SharedState<User[], number>;

export const initialState: UsersState = adapter.getInitialState<User[], number>([]);
export const setUser = adapter.createSetter((user: User) => user.id);

export const usersReducer = createReducer(
  initialState,
  on(actions.getAllUsers, state => adapter.loading(state, state.entities)),
  on(actions.allUsersLoaded, (state, { users }) => adapter.loaded(state, users)),
  on(actions.allUsersLoadFail, (state, { error }) => adapter.loadFail(state, error)),
  on(actions.editUser, state => adapter.saving(state)),
  on(actions.editUserSuccess, (state, { user }) => adapter.saved(state, setUser(state, user))),
  on(actions.editUserFailed, (state, { error }) => adapter.saveFail(state, error))
);
```

### `adapter` Methods

`adapter.getInitialLoadableState<T>(value: T)`

```typescript
{
  entities: value,
  loading: {
    error: null,
    loading: false
  },
  loaded: false
}
```

`adapter.getInitialState<T>(value: T)`

```typescript
{
  entities: value,
  loading: {
    error: null,
    loading: false
  },
  loaded: false,
  saving: {
    error: null,
    loading: false
  },
  selectedId: null
}
```

`adapter.select(state: TState, selectedId: TId) => ({ ...state, selectedId })`

`adapter.loading(state: TState, entities: TData) => ({ ...state, entities, loading: { loading: true, error: null } })`

`adapter.loaded(state: TState, entities: TData) => ({ ...state, entities, loading: { loading: false, error: null }, loaded: true })`

### List of Selectors

| Selectors        | Usage                             |
| ---------------- | --------------------------------- |
| selectEntities   | Select the state entities         |
| selectSaveState  | Select the saving state           |
| selectLoadState  | Select the loading state          |
| selectLoaded     | Select the loaded value           |
| selectSelectedId | Select the selected id            |

## Interfaces

`@ngrxs/states` exposes interfaces.

`LoadableState`

```typescript
{
  error: string | null;
  loading: boolean;
}
```

`SharedLoadableState<TData>`

```typescript
{
  readonly entities: TData;
  readonly loading: LoadableState;
  readonly loaded: boolean;
}
```

`SharedState<TData, TId extends number | string | null>`

```typescript
{
  readonly entities: TData;
  readonly loading: LoadableState;
  readonly loaded: boolean;
  readonly saving: LoadableState;
  readonly selectedId: TId;
}
```

## `fetch` method

a method `fetch` fetching state data from service.

```typescript
fetch(options: {
  id?: (action: TAction) => PropertyKey          // (optional) get the unique id to group results.
  ttl?: number                                   // (optional) when provided it caches the result. ttl is in milliseconds.
  fetch: (action: TAction) => Observable<TData>; // the fetch action
  mapFn: (data: TData) => Action;                // the action mapper function
  errorFn: (error: Error) => Action;             // the error mapper function
})
```

*Example*

```typescript
import { fetch } from '@ngrxs/states';

@Injectable()
export class UsersEffects {
  readonly #actions$ = inject(Actions);
  readonly #service = inject(UsersService);
  
  loadUsers$ = createEffect(() =>
    this.#actions$.pipe(
      ofType(actions.getAllUsers),
      fetch({
        fetch: () => this.#service.getAllUsers(),
        mapFn: payload => actions.allUsersLoaded({ users: payload }),
        errorFn: error => actions.allUsersLoadFail({ error }),
      })
    )
  );

  getUserById$ = createEffect(() =>
    this.#actions$.pipe(
      ofType(actions.getByUserId),
      fetch({
        id: ({ id }) => `user_${id}`,
        ttl: 5_000,
        fetch: ({ id }) => this.#service.getUserById(id),
        mapFn: user => actions.userLoaded({ user }),
        errorFn: error => actions.userLoadFail({ error }),
      })
    )
  );
}
```
