import { Observable, of as observableOf } from 'rxjs';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { ObjectAuthorizationsState } from '../../core/data/feature-authorization/authorization.interfaces';

export class AuthorizationDataServiceStub {
  isAuthorized(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string): Observable<boolean> {
    return observableOf(false);
  }

  getAuthorizationForObjects(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<ObjectAuthorizationsState> {
    return observableOf({});
  }
}
