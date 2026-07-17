import {
  AsyncPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { getDSORoute } from '../../app-routing-paths';
import { Audit } from '../../core/audit/model/audit.model';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { URLCombiner } from '../../core/url-combiner/url-combiner';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { StringReplacePipe } from '../../shared/utils/string-replace.pipe';
import { VarDirective } from '../../shared/utils/var.directive';

/**
 * Renders a paginated table of audit records, either in overview mode for all the environemnt or tied to a specific DSpaceObject.
 * Supports row expansion to show details.
 */

@Component({
  selector: 'ds-audit-table',
  templateUrl: './audit-table.component.html',
  imports: [
    AsyncPipe,
    DatePipe,
    NgbCollapseModule,
    NgClass,
    NgTemplateOutlet,
    PaginationComponent,
    RouterLink,
    StringReplacePipe,
    TranslateModule,
    VarDirective,
  ],
})
export class AuditTableComponent {
  /**
   * The Audit items to be shown
   */
  @Input() audits: PaginatedList<Audit>;

  /**
   * Config for pagination
   */
  @Input() pageConfig: PaginationComponentOptions;

  /**
   * Whether the table is used for a an overview of all the site's Audits
   */
  @Input() isOverviewPage: boolean;

  /**
   * The DSpaceObject used in case of a detail audit page
   */
  @Input() object: DSpaceObject;

  /**
   * Path for audit logs
   */
  readonly auditPath = 'auditlogs';


  /**
   * Date format to use for start and end time of audits
   */
  protected readonly dateFormat = 'yyyy-MM-dd HH:mm:ss';

  constructor(
    private dsoNameService: DSONameService,
    private changeDetectorRef: ChangeDetectorRef,
    private dsoDataService: DSpaceObjectDataService,
  ) {}


  toggleCollapse(audit: Audit) {
    audit.isCollapsed = !audit.isCollapsed;
    this.changeDetectorRef.detectChanges();
  }

  getObjectRoute$(id: string): Observable<string> {
    return this.dsoDataService.findById(id).pipe(
      getFirstSucceededRemoteDataPayload(),
      map(resolvedDso =>  new URLCombiner(getDSORoute(resolvedDso), this.auditPath).toString()),
    );
  }

  getDsoName(dso: DSpaceObject): string {
    return this.dsoNameService.getName(dso);
  }
}
