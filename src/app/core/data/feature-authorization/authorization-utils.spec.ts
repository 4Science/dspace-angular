import { of } from 'rxjs';
import { take } from 'rxjs/operators';

import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { Authorization } from '../../shared/authorization.model';
import { Feature } from '../../shared/feature.model';
import {
  getAuthorizationFeaturesIDs,
  getAuthorizationObjectKey,
} from './authorization-utils';
import { FeatureID } from './feature-id';

describe('authorization-utils', () => {
  describe('getAuthorizationObjectKey', () => {
    it('should return the trailing id of a workspaceitem authorization id', () => {
      const id = '697570a4-e9dc-4cd5-a332-cd6248a267da_canEditItem_submission.workspaceitem_3057';
      expect(getAuthorizationObjectKey(id)).toEqual('3057');
    });

    it('should return the trailing id of a workflowitem authorization id', () => {
      const id = '697570a4-e9dc-4cd5-a332-cd6248a267da_canEditItem_workflow.workflowitem_42';
      expect(getAuthorizationObjectKey(id)).toEqual('42');
    });

    it('should return the uuid for an item authorization id', () => {
      const itemUuid = 'd317ff64-7b14-4b8f-9c0a-1234567890ab';
      const id = `697570a4-e9dc-4cd5-a332-cd6248a267da_canEditItem_core.item_${itemUuid}`;
      expect(getAuthorizationObjectKey(id)).toEqual(itemUuid);
    });

    it('should return the uuid for a site authorization id', () => {
      const siteUuid = 'f92d103c-e4ad-4dfb-b59f-f90c7425407e';
      const id = `697570a4-e9dc-4cd5-a332-cd6248a267da_isCommunityAdmin_core.site_${siteUuid}`;
      expect(getAuthorizationObjectKey(id)).toEqual(siteUuid);
    });

    it('should fall back to the part after the last underscore when there is no dot', () => {
      expect(getAuthorizationObjectKey('eperson_feature_item_abc')).toEqual('abc');
    });

    it('should return undefined when the id has no value', () => {
      expect(getAuthorizationObjectKey(undefined)).toBeUndefined();
      expect(getAuthorizationObjectKey(null)).toBeUndefined();
      expect(getAuthorizationObjectKey('')).toBeUndefined();
    });
  });

  describe('getAuthorizationFeaturesIDs', () => {
    const grantedAuthorization = (id: string, featureId: FeatureID) => Object.assign(new Authorization(), {
      id,
      feature: createSuccessfulRemoteDataObject$(Object.assign(new Feature(), { id: featureId })),
    });

    it('should key the resulting map by the id parsed from each authorization id', (done) => {
      const authorizations = [
        grantedAuthorization('eperson_canEditItem_submission.workspaceitem_701', FeatureID.CanEditItem),
      ];
      of(authorizations).pipe(
        getAuthorizationFeaturesIDs([FeatureID.CanEditItem], ['701']),
        take(1),
      ).subscribe((state) => {
        expect(state['701']).toEqual({ [FeatureID.CanEditItem]: true });
        done();
      });
    });

    it('should seed requested keys that are missing from the response as not granted', (done) => {
      const authorizations = [
        grantedAuthorization('eperson_canEditItem_submission.workspaceitem_701', FeatureID.CanEditItem),
      ];
      of(authorizations).pipe(
        getAuthorizationFeaturesIDs([FeatureID.CanEditItem], ['701', '698']),
        take(1),
      ).subscribe((state) => {
        expect(state['701']).toEqual({ [FeatureID.CanEditItem]: true });
        // Must still have a definitive (false) entry so no redundant single-object request is made.
        expect(state['698']).toEqual({ [FeatureID.CanEditItem]: false });
        done();
      });
    });

    it('should seed all requested keys as not granted when the response is empty', (done) => {
      of([] as Authorization[]).pipe(
        getAuthorizationFeaturesIDs([FeatureID.CanEditItem], ['701', '698']),
        take(1),
      ).subscribe((state) => {
        expect(state['701']).toEqual({ [FeatureID.CanEditItem]: false });
        expect(state['698']).toEqual({ [FeatureID.CanEditItem]: false });
        done();
      });
    });
  });
});
