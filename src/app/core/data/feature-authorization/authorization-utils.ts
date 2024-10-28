import { map, switchMap } from 'rxjs/operators';
import {
  combineLatest,
  combineLatest as observableCombineLatest,
  forkJoin,
  from,
  Observable,
  of as observableOf
} from 'rxjs';
import { AuthorizationSearchParams } from './authorization-search-params';
import { SiteDataService } from '../site-data.service';
import { hasNoValue, hasValue, isNotEmpty } from '../../../shared/empty.util';
import { AuthService } from '../../auth/auth.service';
import { Authorization } from '../../shared/authorization.model';
import { Feature } from '../../shared/feature.model';
import { FeatureID } from './feature-id';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload } from '../../shared/operators';
import { ObjectAuthorizationFeaturesMap, ObjectAuthorizationsState } from "./authorization.interfaces";

/**
 * Operator accepting {@link AuthorizationSearchParams} and adding the current {@link Site}'s selflink to the parameter's
 * objectUrl property, if this property is empty
 * @param siteService The {@link SiteDataService} used for retrieving the repository's {@link Site}
 */
export const addSiteObjectUrlIfEmpty = (siteService: SiteDataService) =>
  (source: Observable<AuthorizationSearchParams>): Observable<AuthorizationSearchParams> =>
    source.pipe(
      switchMap((params: AuthorizationSearchParams) => {
        if (hasNoValue(params.objectUrl)) {
          return siteService.find().pipe(
            map((site) => Object.assign({}, params, { objectUrl: site.self }))
          );
        } else {
          return observableOf(params);
        }
      })
    );

/**
 * Operator accepting {@link AuthorizationSearchParams} and adding the authenticated user's uuid to the parameter's
 * ePersonUuid property, if this property is empty and an {@link EPerson} is currently authenticated
 * @param authService The {@link AuthService} used for retrieving the currently authenticated {@link EPerson}
 */
export const addAuthenticatedUserUuidIfEmpty = (authService: AuthService) =>
  (source: Observable<AuthorizationSearchParams>): Observable<AuthorizationSearchParams> =>
    source.pipe(
      switchMap((params: AuthorizationSearchParams) => {
        if (hasNoValue(params.ePersonUuid)) {
          return authService.isAuthenticated().pipe(
            switchMap((authenticated) => {
              if (authenticated) {
                return authService.getAuthenticatedUserFromStore().pipe(
                  map((ePerson) => Object.assign({}, params, { ePersonUuid: ePerson.uuid }))
                );
              } else {
                return observableOf(params);
              }
            })
          );
        } else {
          return observableOf(params);
        }
      })
    );

/**
 * Operator checking if at least one of the provided {@link Authorization}s contains a {@link Feature} that matches the
 * provided {@link FeatureID}
 * Note: This expects the {@link Authorization}s to contain a resolved link to their {@link Feature}. If they don't,
 * this observable will always emit false.
 * @param featureID
 * @returns true if at least one {@link Feature} matches, false if none do
 */
export const oneAuthorizationMatchesFeature = (featureID: FeatureID) =>
  (source: Observable<Authorization[]>): Observable<boolean> =>
    source.pipe(
      switchMap((authorizations: Authorization[]) => {
        if (isNotEmpty(authorizations)) {
          return observableCombineLatest([
            ...authorizations
              .filter((authorization: Authorization) => hasValue(authorization.feature))
              .map((authorization: Authorization) => authorization.feature.pipe(
                getFirstSucceededRemoteDataPayload()
              ))
          ]);
        } else {
          return observableOf([]);
        }
      }),
      map((features: Feature[]) => features.filter((feature: Feature) => feature.id === featureID).length > 0)
    );


/**
 * Note: This expects the {@link Authorization}s to contain a resolved link to their {@link Feature}. If they don't,
 * this observable will always emit false.
 * @returns a list to {@link Feature}s IDs.
 */
export const getAuthorizationFeaturesIDs = (featureIDs: FeatureID[]) =>
  (source: Observable<Authorization[]>): Observable<ObjectAuthorizationsState> =>
    source.pipe(
      switchMap((authorizations: Authorization[]) => {
        if (isNotEmpty(authorizations)) {
          return combineLatest([
            ...authorizations.map(auth => auth.object.pipe(getFirstCompletedRemoteData())),
            ...authorizations.map(auth => auth.feature.pipe(getFirstCompletedRemoteData())),
          ]).pipe(
            map((data) => {
              const features = data.map(rd => rd.payload).filter(dso => dso instanceof Feature) as Feature[];
              const objects = data.map(rd => rd.payload).filter(dso => !(dso instanceof Feature))
              let objectToFeaturesMap = {}

              objects.forEach(object => {
                objectToFeaturesMap = Object.assign({}, objectToFeaturesMap, {
                  [object.self]: getFeatureIdToBooleanMap(featureIDs, features)
                })
              })
              return objectToFeaturesMap
            })
          )
        } else {
          return observableOf({});
        }
      }),
    );


/**
 *
 */
export const getFeatureIdToBooleanMap = (featureIDs: FeatureID[], features: Feature[]) : ObjectAuthorizationFeaturesMap => {
  let mapFeatureToBoolean = {};
  featureIDs.forEach(id => {
    mapFeatureToBoolean[id] = hasValue(features.find(feature => feature.id === id))
  })
  return  mapFeatureToBoolean
}


/**
 * Extract Uuid from authorization id.
 * the feature id from the authorization id that is composed as follows:
 * epersonUuid_featureID_itemType_itemUuid
 *
 * uuid of workspace or workflow items are made as follows workspace_id or workflow_id
 * @param authId
 * @private
 */

export const extractUuidFromAuthorizationId = (authId: string): string => {
  const authSegments = authId.split('_');
  const idSegment = authSegments[authSegments.length - 1];

  return idSegment.includes('_') ? idSegment.split('_')[1] : idSegment;
}

/**
 * Extract FeatureId from authorization id.
 * the feature id from the authorization id that is composed as follows:
 * epersonUuid_featureID_itemType_itemUuid
 *
 * @param authId
 * @private
 */
export const extractFeatureIdFromAuthorizationId = (authId: string): string => {
  const authSegments = authId.split('_');

  return authSegments[1] as FeatureID;
}
