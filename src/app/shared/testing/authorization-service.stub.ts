import {
  Observable,
  of,
  throwError,
} from 'rxjs';

import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { ObjectAuthorizationsState } from "../authorizations/authorization.interfaces";


export class AuthorizationDataServiceStub {
  private withError;
  constructor(withError = false) {
    this.withError = withError;
  }
  isAuthorized(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string): Observable<boolean> {
    return of(false);
  }

  getAuthorizationForObjects(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<ObjectAuthorizationsState> {
    if (this.withError) {
      return throwError(() => new Error('Test error'));
    }
    return of({});
  }
}
