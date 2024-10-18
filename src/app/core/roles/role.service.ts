import { Injectable } from '@angular/core';

import { Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { RoleType } from './role-types';
import { CollectionDataService } from '../data/collection-data.service';
import { FeatureID } from '../data/feature-authorization/feature-id';
import { SiteAuthorizationService } from '../data/feature-authorization/site-authorization.service';


/**
 * A service that provides methods to identify user role.
 */
@Injectable()
export class RoleService {

  /**
   * Initialize instance variables
   *
   * @param {CollectionDataService} collectionService
   * @param siteAuthorizationService
   */
  constructor(
    private collectionService: CollectionDataService,
    private siteAuthorizationService: SiteAuthorizationService
    ) {
  }

  /**
   * Check if current user is a submitter
   */
  isSubmitter(): Observable<boolean> {
    // By applying switchMap, we address the cache problem typically associated with observables
    // the switchMap operator cancels the previous inner observable and subscribes to the new one, effectively initiating a fresh request
    return observableOf(true).pipe(
      switchMap(() => this.collectionService.hasAuthorizedCollection())
    );
  }

  /**
   * Check if current user is a controller
   */
  isController(): Observable<boolean> {
    // TODO find a way to check if user is a controller
    return observableOf(true);
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): Observable<boolean> {
    return this.siteAuthorizationService.getSiteAuthorization(FeatureID.AdministratorOf);
  }

  /**
   * Check if current user by role type
   *
   * @param {RoleType} role
   *    the role type
   */
  checkRole(role: RoleType): Observable<boolean> {
    let check: Observable<boolean>;
    switch (role) {
      case RoleType.Submitter:
        check = this.isSubmitter();
        break;
      case RoleType.Controller:
        check = this.isController();
        break;
      case RoleType.Admin:
        check = this.isAdmin();
        break;
    }

    return check;
  }
}
