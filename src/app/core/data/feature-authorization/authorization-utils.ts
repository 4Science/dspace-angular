import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import {
  combineLatest,
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf
} from 'rxjs';
import { hasValue, isNotEmpty } from '../../../shared/empty.util';
import { Authorization } from '../../shared/authorization.model';
import { Feature } from '../../shared/feature.model';
import { FeatureID } from './feature-id';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload } from '../../shared/operators';
import { ObjectAuthorizationFeaturesMap, ObjectAuthorizationsState } from './authorization.interfaces';
import { DSpaceObject } from '../../shared/dspace-object.model';


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
export const getAuthorizationFeaturesIDs = (featureIDs: FeatureID[], hrefs: string[]) =>
  (source: Observable<Authorization[]>): Observable<ObjectAuthorizationsState> =>
    source.pipe(
      switchMap((authorizations: Authorization[]) => {
        let objectToFeaturesMap = {};
        if (isNotEmpty(authorizations)) {
          return combineLatest([
            ...authorizations.map(auth => auth.object.pipe(getFirstCompletedRemoteData(),take(1))),
            ...authorizations.map(auth => auth.feature.pipe(getFirstCompletedRemoteData(),take(1))),
          ]).pipe(
            map((data) => {
              const features = data.map(rd => rd.payload).filter(dso => dso instanceof Feature) as Feature[];
              const objects = data.map(rd => rd.payload).filter(dso => !(dso instanceof Feature));

              objects.forEach(object => {
                objectToFeaturesMap = Object.assign({}, objectToFeaturesMap, {
                  [object.self]: getFeatureIdToBooleanMap(featureIDs, features)
                });
              });
              return objectToFeaturesMap;
            })
          );
        } else {
          hrefs.forEach(href => {
            objectToFeaturesMap = Object.assign({}, objectToFeaturesMap, {
              [href]: getFeatureIdToBooleanMap(featureIDs, [])
            });
          });
          return observableOf(objectToFeaturesMap);
        }
      }),
      distinctUntilChanged(),
    );


/**
 *
 */
export const getFeatureIdToBooleanMap = (featureIDs: FeatureID[], features: Feature[]): ObjectAuthorizationFeaturesMap => {
  let mapFeatureToBoolean = {};
  featureIDs.forEach(id => {
    mapFeatureToBoolean[id] = hasValue(features.find(feature => feature.id === id));
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
 * Method to create an identifier for auth request based on params
 */
export const getRequestIdFromParams = (type: string, uuidList: string[], featureIDs: FeatureID[]): string => {
  return  type?.concat(...uuidList)?.concat(...featureIDs);
};
