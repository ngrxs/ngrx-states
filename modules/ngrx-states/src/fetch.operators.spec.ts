import { fakeAsync, tick } from '@angular/core/testing';
import { createAction, props } from '@ngrx/store';

import { delay, firstValueFrom, Observable, of, Subject } from 'rxjs';

import { fetch } from './fetch.operators';

import { when } from 'jest-when';

const successAction = createAction('[TEST] RESULT', props<{ data: string }>());
const byId = createAction('[TEST] BY ID', props<{ id: number }>());
const resolveSuccessAction = async <T>(obs$: Observable<T>): Promise<string> =>
  ((await firstValueFrom(obs$)) as ReturnType<typeof successAction>).data;

describe('fetch', () => {
  let subject$: Subject<ReturnType<typeof byId>>;

  beforeEach(() => {
    subject$ = new Subject<ReturnType<typeof byId>>();
  });

  it('should return', async () => {
    const result$ = of('success');
    const data$ = subject$.pipe(
      fetch({
        fetch: () => result$,
        mapFn: (data) => successAction({ data }),
        errorFn: (message) => ({ type: 'ERROR', message })
      })
    );

    const dataPromise = resolveSuccessAction(data$);

    subject$.next(byId({ id: 1 }));

    expect(await dataPromise).toBe('success');
  });

  it('allow 1 call per id group at the same time', fakeAsync(() => {
    const getResult: (id: number) => Observable<string> = jest.fn();
    const results: string[] = [];
    const subscription = subject$
      .pipe(
        fetch({
          id: ({ id }) => `entity_${id}`,
          fetch: ({ id }) => getResult(id),
          mapFn: (data) => successAction({ data }),
          errorFn: (message) => ({ type: 'ERROR', message })
        })
      )
      .subscribe((action) => {
        results.push((action as ReturnType<typeof successAction>).data);
      });

    when(getResult)
      .calledWith(1)
      .mockReturnValue(of('1st').pipe(delay(300)));
    when(getResult)
      .calledWith(2)
      .mockReturnValue(of('2nd').pipe(delay(300)));

    const asyncNext = (id: number) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          subject$.next(byId({ id }));
          resolve();
        }, 0);
      });

    void asyncNext(1);
    void asyncNext(1);
    void asyncNext(1);
    void asyncNext(2);
    void asyncNext(2);
    tick(300);

    subscription.unsubscribe();

    expect(results.length).toBe(2);

    expect(getResult).toHaveBeenCalledTimes(5);
    expect(getResult).toHaveBeenCalledWith(1);
    expect(getResult).toHaveBeenCalledWith(2);
  }));

  it('should cache', fakeAsync(() => {
    const getResult: (id: number) => Observable<string> = jest.fn();
    const results: string[] = [];
    const subscription = subject$
      .pipe(
        fetch({
          id: ({ id }) => `test_${id}`,
          ttl: 1234,
          fetch: ({ id }) => getResult(id),
          mapFn: (data) => successAction({ data }),
          errorFn: (message) => ({ type: 'ERROR', message })
        })
      )
      .subscribe((action) => {
        results.push((action as ReturnType<typeof successAction>).data);
      });

    when(getResult)
      .calledWith(1)
      .mockReturnValue(of('1st').pipe(delay(300)));

    subject$.next(byId({ id: 1 }));
    tick(300);
    subject$.next(byId({ id: 1 }));
    tick(933);
    subject$.next(byId({ id: 1 }));

    expect(getResult).toHaveBeenCalledTimes(1);
    expect(getResult).toHaveBeenCalledWith(1);
    expect(results.length).toBe(3);

    tick(1);
    subject$.next(byId({ id: 1 }));

    expect(getResult).toHaveBeenCalledTimes(1);
    expect(results.length).toBe(4);

    subscription.unsubscribe();
  }));
});
