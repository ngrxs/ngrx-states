import { Observable, of, OperatorFunction, switchMap, tap } from 'rxjs';

class ObservableCache<TData> {
  #value?: TData;
  #observable?: Observable<TData>;
  #expireTime?: number;

  get #now(): number {
    return +new Date();
  }

  get hasValue(): boolean {
    return typeof this.#value !== 'undefined';
  }

  get hasObservable(): boolean {
    return typeof this.#observable !== 'undefined';
  }

  get valid(): boolean {
    return this.hasValue || this.#expireTime > this.#now;
  }

  get value(): TData {
    return this.#value;
  }

  get observable$(): Observable<TData> {
    return this.#observable;
  }

  constructor(readonly ttl: number) {}

  set(value: TData): void {
    this.#value = value;
    this.#observable = undefined;
    this.#expireTime = this.#now + this.ttl;
  }

  setObservable(obs$: Observable<TData>): void {
    this.#value = undefined;
    this.#observable = obs$.pipe(tap((value) => this.set(value)));
  }
}

function _cachedMergeMap<T, O extends Observable<TData>, TData>(
  project: (value: T, index: number) => O,
  cache: ObservableCache<TData>
): OperatorFunction<T, TData> {
  return switchMap((action, index) => {
    if (cache.valid) {
      return of(cache.value);
    } else if (cache.hasObservable) {
      return cache.observable$;
    } else {
      const obs$ = project(action, index);
      cache.setObservable(obs$);
      return obs$;
    }
  });
}

export function cachedMergeMap<T, O extends Observable<TData>, TData>(
  project: (value: T, index: number) => O,
  ttl?: number | null
): OperatorFunction<T, TData> {
  const willExpire = typeof ttl === 'number' && ttl !== null && ttl > 0;
  return willExpire
    ? _cachedMergeMap<T, O, TData>(project, new ObservableCache<TData>(ttl))
    : switchMap(project);
}
