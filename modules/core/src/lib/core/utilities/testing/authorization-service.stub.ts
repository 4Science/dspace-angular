import {
  Observable,
  of as observableOf,
} from 'rxjs';

import { FeatureID } from '../../data';

export class AuthorizationDataServiceStub {
  isAuthorized(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string): Observable<boolean> {
    return observableOf(false);
  }
}
