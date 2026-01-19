/* eslint-disable no-empty, @typescript-eslint/no-empty-function */
import {
  Observable,
  of,
} from 'rxjs';

export class AuthServiceMock {
  public checksAuthenticationToken() {
    return;
  }
  public buildAuthHeader() {
    return 'auth-header';
  }

  public getShortlivedToken(): Observable<string> {
    return of('token');
  }

  public isAuthenticated(): Observable<boolean> {
    return of(true);
  }

  public setRedirectUrl(url: string) {
  }

  public trackTokenExpiration(): void {
  }

  public isUserIdle(): Observable<boolean> {
    return of(false);
  }
}
