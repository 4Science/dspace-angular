import { Router } from '@angular/router';
import {
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  switchMap,
  take,
} from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { RemoteData } from '../../../core/data/remote-data';
import { redirectOn4xx } from '../../../core/shared/authorized.operators';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';

export const fetchNonNull = <T>(router: Router, authService: AuthService) =>
  (source: Observable<RemoteData<T>>): Observable<T> =>
    source.pipe(
      switchMap((remoteData: RemoteData<T>) => {
        if (remoteData == null) {
          return of(null);
        }
        return of(remoteData)
          .pipe(
            redirectOn4xx(router, authService),
            getFirstSucceededRemoteDataPayload(),
            filter(Object),
          );
      }),
      take(1),
    );
