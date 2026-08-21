import {
  AsyncPipe,
  Location,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Data,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  forkJoin,
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { getDSORoute } from '../../app-routing-paths';
import { COLLECTION_PAGE_LINKS_TO_FOLLOW } from '../../collection-page/collection-page.resolver';
import { Audit } from '../../core/audit/model/audit.model';
import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { SortDirection } from '../../core/cache/models/sort-options.model';
import { AuditDataService } from '../../core/data/audit-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { ItemDataService } from '../../core/data/item-data.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginationService } from '../../core/pagination/pagination.service';
import { Collection } from '../../core/shared/collection.model';
import { Item } from '../../core/shared/item.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../core/shared/operators';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { createFailedRemoteDataObject } from '../../shared/remote-data.utils';
import { AuditTableComponent } from '../audit-table/audit-table.component';
/**
 * Component displaying a list of all audit about a object in a paginated table
 */
@Component({
  selector: 'ds-object-audit-logs',
  templateUrl: './object-audit-logs.component.html',
  imports: [
    AsyncPipe,
    AuditTableComponent,
    RouterLink,
    TranslateModule,
  ],
})
export class ObjectAuditLogsComponent implements OnInit {

  /**
   * The object extracted from the route.
   */
  object: Item;

  /**
   * List of all audits
   */
  auditsRD$: Observable<RemoteData<PaginatedList<Audit>>>;

  /**
   * The current pagination configuration for the page used by the FindAll method
   */
  config: FindListOptions = Object.assign(new FindListOptions(), {
    elementsPerPage: 10,
    sort: {
      field: 'timeStamp',
      direction: SortDirection.DESC,
    },
  });

  /**
   * The current pagination configuration for the page
   */
  pageConfig: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'oop',
    pageSize: 10,
  });

  /**
   * Date format to use for start and end time of audits
   */
  dateFormat = 'yyyy-MM-dd HH:mm:ss';

  objectId$: Observable<string>;

  objectId: string;

  objectName: string;

  objectRoute: string;

  owningCollection$: Observable<Collection>;

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected auditService: AuditDataService,
              protected paginationService: PaginationService,
              protected collectionDataService: CollectionDataService,
              protected dsoNameService: DSONameService,
              protected dSpaceObjectDataService: DSpaceObjectDataService,
              protected itemService: ItemDataService,
              protected location: Location,
              protected authorizationService: AuthorizationDataService,
              protected authService: AuthService,
  ) {}


  ngOnInit(): void {
    this.objectId$ = this.route.data.pipe(
      switchMap((data: Data) => {
        const d = this.itemService.findById(data.dso.payload.id, true, true);
        return d;
      }),
      getFirstSucceededRemoteDataPayload(),
      tap((object) => {
        this.object = object;
        this.objectRoute = getDSORoute(object);
        this.objectId = object.id;
        this.objectName = this.dsoNameService.getName(object);
        this.owningCollection$ = this.collectionDataService.findOwningCollectionFor(
          object,
          true,
          false,
          ...COLLECTION_PAGE_LINKS_TO_FOLLOW,
        ).pipe(
          getFirstCompletedRemoteData(),
          map(data => data?.payload),
        );
        this.setAudits();
      }),
      map(dso => dso.id),
    );
  }

  /**
   * Send a request to fetch all audits for the current page
   */
  setAudits() {
    const config$ = this.paginationService.getFindListOptions(this.pageConfig.id, this.config);
    const isAdmin$ = this.isCurrentUserAdmin();
    const parentCommunity$ = this.owningCollection$.pipe(
      switchMap(collection => collection.parentCommunity),
      getFirstCompletedRemoteData(),
      map(data => data?.payload),
    );

    this.auditsRD$ = combineLatest([isAdmin$, config$, this.owningCollection$, parentCommunity$]).pipe(
      mergeMap(([isAdmin, config, owningCollection, parentCommunity]) => {
        if (isAdmin) {
          return this.auditService.findByObject(this.objectId, config, owningCollection.id, parentCommunity.id, true)
            .pipe(
              getFirstCompletedRemoteData(),
            );
        } else {
          return of(createFailedRemoteDataObject<PaginatedList<Audit>>('You do not have permission'));
        }
      }),
      filter(data => data !== null),
      map((audits) => {
        audits.payload?.page.forEach((audit) => {
          audit.hasDetails = this.auditService.auditHasDetails(audit);
        });
        return audits;
      }),
      mergeMap(auditsRD => {
        const updatedAudits$ = auditsRD.payload.page.map(audit => {
          return forkJoin({
            epersonName: this.auditService.getEpersonName(audit),
            otherAuditObject: this.auditService.getOtherObject(audit, this.objectId),
          }).pipe(
            map(({ epersonName, otherAuditObject }) =>
              Object.assign(new Audit(), audit, { epersonName, otherAuditObject }),
            ),
          );
        });
        return forkJoin(updatedAudits$).pipe(
          map(updatedAudits => Object.assign(new RemoteData(
            auditsRD.timeCompleted,
            auditsRD.msToLive,
            auditsRD.lastUpdated,
            auditsRD.state,
            auditsRD.errorMessage,
            Object.assign(new PaginatedList(), { ...auditsRD.payload, page: updatedAudits }),
            auditsRD.statusCode,
          ))),
        );
      }),
    );
  }

  goBack(): void {
    this.location.back();
  }

  isCurrentUserAdmin(): Observable<boolean> {
    return combineLatest([
      this.authorizationService.isAuthorized(FeatureID.IsCollectionAdmin),
      this.authorizationService.isAuthorized(FeatureID.IsCommunityAdmin),
      this.authorizationService.isAuthorized(FeatureID.AdministratorOf),
    ]).pipe(
      map(([isCollectionAdmin, isCommunityAdmin, isSiteAdmin]) => {
        return isCollectionAdmin || isCommunityAdmin || isSiteAdmin;
      }),
      take(1),
    );
  }

}
