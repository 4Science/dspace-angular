import {
  combineLatest,
  combineLatest as observableCombineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import {
  ObjectAuthorizationFeaturesMap,
  ObjectAuthorizationsState,
} from 'src/app/shared/authorizations/authorization.interfaces';

import {
  hasNoValue,
  hasValue,
  isEmpty,
  isNotEmpty,
} from '../../../shared/empty.util';
import { AuthService } from '../../auth/auth.service';
import { Authorization } from '../../shared/authorization.model';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { Feature } from '../../shared/feature.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../shared/operators';
import { SiteDataService } from '../site-data.service';
import { AuthorizationSearchParams } from './authorization-search-params';
import { FeatureID } from './feature-id';

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
            map((site) => Object.assign({}, params, { objectUrl: site.self })),
          );
        } else {
          return of(params);
        }
      }),
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
                  map((ePerson) => Object.assign({}, params, { ePersonUuid: ePerson.uuid })),
                );
              } else {
                return of(params);
              }
            }),
          );
        } else {
          return of(params);
        }
      }),
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
                getFirstSucceededRemoteDataPayload(),
              )),
          ]);
        } else {
          return of([]);
        }
      }),
      map((features: Feature[]) => features.filter((feature: Feature) => feature.id === featureID.valueOf()).length > 0),
    );


/**
 * Note: This expects the {@link Authorization}s to contain a resolved link to their {@link Feature}. If they don't,
 * this observable will always emit false.
 * @returns a list to {@link Feature}s IDs.
 */
export const getAuthorizationFeaturesIDs = (featureIDs: FeatureID[], keys: string[]) =>
  (source: Observable<Authorization[]>): Observable<ObjectAuthorizationsState> =>
    source.pipe(
      switchMap((authorizations: Authorization[]) => {
        let objectToFeaturesMap = {};
        if (isNotEmpty(authorizations)) {
          return combineLatest([
            ...authorizations.map(auth => auth.feature.pipe(getFirstCompletedRemoteData(), take(1)).pipe(
              map((rd) => ({ key: getAuthorizationObjectKey(auth.id), feature: rd.payload })),
            )),
          ]).pipe(
            map((data) => {
              const featuresByKey = new Map<string, Feature[]>();
              data.forEach(({ key, feature }) => {
                if (hasValue(key) && feature instanceof Feature) {
                  const existing = featuresByKey.get(key) ?? [];
                  featuresByKey.set(key, [...existing, feature]);
                }
              });
              const allKeys = new Set<string>([...(keys ?? []), ...featuresByKey.keys()]);
              allKeys.forEach((key) => {
                objectToFeaturesMap = Object.assign({}, objectToFeaturesMap, {
                  [key]: getFeatureIdToBooleanMap(featureIDs, featuresByKey.get(key) ?? []),
                });
              });
              return objectToFeaturesMap;
            }),
          );
        } else {
          keys.forEach(key => {
            objectToFeaturesMap = Object.assign({}, objectToFeaturesMap, {
              [key]: getFeatureIdToBooleanMap(featureIDs, []),
            });
          });
          return of(objectToFeaturesMap);
        }
      }),
      distinctUntilChanged(),
    );


/**
 *
 */
export const getFeatureIdToBooleanMap = (featureIDs: FeatureID[], features: Feature[]): ObjectAuthorizationFeaturesMap => {
  const mapFeatureToBoolean = {};
  featureIDs.forEach(id => {
    mapFeatureToBoolean[id] = hasValue(features.find(feature => feature.id === id.toString()));
  });
  return  mapFeatureToBoolean;
};


/**
 * Normalize Uuid of objects like workspace and workflow e.g. workflow-1234
 * uuid of workspace or workflow items are made as follows workspace_id or workflow_id
 * @private
 * @param dso
 */

export const getNormalizedUuid = (dso: DSpaceObject): string => {
  return dso.type.toString() === 'workspaceitem' || dso.type.toString() === 'workflowitem' ?
    dso.uuid.split('-')[1] : dso.uuid;
};


/**
 * Derive the store key for an {@link Authorization} from its id.
 *
 * The part after the last `.` is the `itemType_id`; the key we use to index
 * the authorization store is the trailing `id`. This matches {@link getNormalizedUuid}.
 *
 * @param authorizationId the {@link Authorization} id as returned by the REST API
 * @returns the id used as the authorization store key, or `undefined` when it cannot be derived
 */
export const getAuthorizationObjectKey = (authorizationId: string): string => {
  if (isEmpty(authorizationId)) {
    return undefined;
  }
  const itemTypeId = authorizationId.includes('.')
    ? authorizationId.substring(authorizationId.lastIndexOf('.') + 1)
    : authorizationId;
  return itemTypeId.includes('_')
    ? itemTypeId.substring(itemTypeId.lastIndexOf('_') + 1)
    : itemTypeId;
};


/**
 * Method to create an identifier for auth request based on params
 */
export const getRequestIdFromParams = (type: string, uuidList: string[], featureIDs: FeatureID[]): string => {
  return  type?.concat(...uuidList)?.concat(...featureIDs);
};
