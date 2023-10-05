import { Action } from '@ngrx/store';

import { Observable, of, OperatorFunction } from 'rxjs';
import { catchError, groupBy, map, mergeMap, switchMap } from 'rxjs/operators';

import { cachedMergeMap } from './cache';

function runWithErrorHandling<A, R, E>(
  run: (a: A) => Observable<R>,
  onError: (error: Error) => Observable<E>
) {
  return (action: A): Observable<R | E> => {
    try {
      return run(action).pipe(catchError(onError));
    } catch (e) {
      return onError(e as Error);
    }
  };
}

type TypeFactory<TParam, TType> = (data: TParam) => TType;

/** fetch data with consistent approach */
export function fetch<
  TAction extends Action,
  TData,
  TMap extends Action,
  TError extends Action
>(opts: {
  id?: (action: TAction) => PropertyKey;
  ttl?: number;
  fetch: (action: TAction) => Observable<TData>;
  mapFn: TypeFactory<TData, TMap>;
  errorFn: TypeFactory<string, TError>;
}): OperatorFunction<TAction, TMap | TError> {
  const onMap = (a: TAction) => opts.fetch(a).pipe(map(opts.mapFn));
  const onError = (error: Error) => of(opts.errorFn(error.message));
  if (opts.id) {
    const id = opts.id;
    return (source: Observable<TAction>): Observable<TMap | TError> =>
      source.pipe(
        groupBy((action) => id(action)),
        mergeMap((pairs) =>
          pairs.pipe(
            cachedMergeMap<TAction, Observable<TMap | TError>, TMap | TError>(
              runWithErrorHandling(onMap, onError),
              opts.ttl
            )
          )
        )
      );
  }

  return (source: Observable<TAction>): Observable<TMap | TError> =>
    source.pipe(cachedMergeMap(runWithErrorHandling(onMap, onError), opts.ttl));
}
