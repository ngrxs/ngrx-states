import { createAction, props } from '@ngrx/store';
import { fetch } from './fetch.operators';
import { firstValueFrom, of } from 'rxjs';

const successAction = createAction('[TEST] RESULT', props<{ data: string }>());

describe('fetch', () => {
  it('should return', async () => {
    const result$ = of('success');
    const data$ = of({ type: 'TEST' }).pipe(
      fetch({
        fetch: () => result$,
        mapFn: (data) => successAction({ data }),
        errorFn: (message) => ({ type: 'ERROR', message })
      })
    );

    const action = (await firstValueFrom(data$)) as ReturnType<typeof successAction>;
    expect(action.type).toBe('[TEST] RESULT');
    expect(action.data).toBe('success');
  });
});
