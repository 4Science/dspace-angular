import {
  AsyncPipe,
  DatePipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { AuditDataService } from '../../core/audit/audit-data.service';
import { Audit } from '../../core/audit/model/audit.model';
import { AuthService } from '../../core/auth/auth.service';
import { SortDirection } from '../../core/cache/models/sort-options.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { ItemDataService } from '../../core/data/item-data.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginationService } from '../../core/pagination/pagination.service';
import { redirectOn4xx } from '../../core/shared/authorized.operators';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { VarDirective } from '../../shared/utils/var.directive';

/**
 * Component displaying a list of all audit about a object in a paginated table
 */
@Component({
  selector: 'ds-object-audit-overview',
  templateUrl: './object-audit-overview.component.html',
  imports: [
    PaginationComponent,
    NgIf,
    AsyncPipe,
    TranslateModule,
    NgForOf,
    VarDirective,
    RouterLink,
    DatePipe,
  ],
  standalone: true,
})
export class ObjectAuditOverviewComponent implements OnInit {

  /**
   * The object extracted from the route.
   */
  object;

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

  constructor(protected authService: AuthService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected auditService: AuditDataService,
              protected itemService: ItemDataService,
              protected authorizationService: AuthorizationDataService,
              protected paginationService: PaginationService) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      mergeMap((paramMap: ParamMap) => this.itemService.findById(paramMap.get('objectId'))),
      getFirstCompletedRemoteData(),
      redirectOn4xx(this.router, this.authService),
    ).subscribe((rd) => {
      this.object = rd.payload;
      this.setAudits();
    });
  }

  /**
   * Send a request to fetch all audits for the current page
   */
  setAudits() {
    const config$ = this.paginationService.getFindListOptions(this.pageConfig.id, this.config, this.pageConfig);
    const isAdmin$ = this.isCurrentUserAdmin();
    this.auditsRD$ = combineLatest([isAdmin$, config$]).pipe(
      mergeMap(([isAdmin, config]) => {
        if (isAdmin) {
          return this.auditService.findByObject(this.object.id, config);
        }
      }),
    );
  }

  isCurrentUserAdmin(): Observable<boolean> {
    return this.authorizationService.isAuthorized(FeatureID.AdministratorOf, undefined, undefined);
  }

  /**
   * Get the name of an EPerson by ID
   * @param audit  Audit object
   */
  getEpersonName(audit: Audit): Observable<string> {
    return this.auditService.getEpersonName(audit);
  }

  getOtherObject(audit: Audit, contextObjectId: string): Observable<any> {
    return this.auditService.getOtherObject(audit, contextObjectId);
  }

}
