import { Authorization } from '../../shared/authorization.model';
import { ResourceType } from '../../shared/resource-type';
import { Feature } from '../../shared/feature.model';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { Observable, of } from 'rxjs';
import { FeatureID } from './feature-id';
import { GetAuthorizationsAction } from './authorization.actions';
import { SiteDataService } from '../site-data.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.reducer';
import { take } from 'rxjs/operators';
import { ObjectAuthorizationsState } from './authorization.interfaces';

export const mockFeatures = [
  {
    id: 'administratorOf',
    description: 'It can be used for verify that an user has access to the administrative features of the repository or of a specific community and collection',
    type: new ResourceType('feature'),
    uniqueType: 'authz.feature',
    resourcetypes: [
      'core.site',
      'core.community',
      'core.collection',
      'core.item'
    ],
    _links: {
      self: {
        href: 'http://localhost:8080/server/api/authz/features/administratorOf'
      }
    }
  }
] as Feature[];

export const mockAuthSiteObject = {
  id: 'f92d103c-e4ad-4dfb-b59f-f90c7425407e',
  uuid: 'f92d103c-e4ad-4dfb-b59f-f90c7425407e',
  name: 'DSpace at My University',
  metadata: {},
  type: new ResourceType('site'),
  uniqueType: 'core.site',
  _links: {
    self: {
      href: 'host/server/api/core/sites/f92d103c-e4ad-4dfb-b59f-f90c7425407e'
    }
  }
} as DSpaceObject;

export const mockSiteAuthorizations = [
  {
    id: '26d8e404-1594-442f-b468-e0deaf4a0a78_administratorOf_core.site_f92d103c-e4ad-4dfb-b59f-f90c7425407e',
    type: new ResourceType('authorization'),
    uniqueType: 'authz.authorization',
    feature: of(mockFeatures[0]),
    object: of(mockAuthSiteObject)
  }
] as any as Authorization[];



export class AuthServiceStub {

  constructor(
    private siteService: SiteDataService,
    private store: Store<AppState>,
    private state: any,
  ) {
  }

  initStateForObjects(uuidList: string[], type: string, featureIDs: FeatureID[]) {
    this.store.dispatch(new GetAuthorizationsAction(uuidList, type, featureIDs));
  }

  initStateForSite(featureIDs: FeatureID[]) {
    this.siteService.find().pipe(
      take(1)
    ).subscribe(site => this.initStateForObjects([site.uuid], site.uniqueType, featureIDs));
  }

  getAllAuthorizationsState(): Observable<ObjectAuthorizationsState> {
    return of(this.state);
  }

  getAuthorizationForObject(featureId: FeatureID, objectUrl: string): Observable<boolean> {
    return of(this.state.authorizations[objectUrl]);
  }

  hasErrors(): Observable<boolean> {
    return of(this.state.hasErrors);
  }

  isLoading(): Observable<boolean> {
    return of(this.state.loading);
  }
}
