import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Observable, of } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { filter, switchMap, take } from 'rxjs/operators';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { redirectOn4xx } from '../../../core/shared/authorized.operators';

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
      take(1)
    );
