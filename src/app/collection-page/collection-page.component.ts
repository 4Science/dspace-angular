import {
  AsyncPipe,
  isPlatformServer,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  take,
} from 'rxjs/operators';

import {
  APP_CONFIG,
  AppConfig,
} from '../../config/app-config.interface';
import { AuthService } from '../core/auth/auth.service';
import { DSONameService } from '../core/breadcrumbs/dso-name.service';
import { SortOptions } from '../core/cache/models/sort-options.model';
import { AuthorizationDataService } from '../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../core/data/feature-authorization/feature-id';
import { RemoteData } from '../core/data/remote-data';
import { redirectOn4xx } from '../core/shared/authorized.operators';
import { Bitstream } from '../core/shared/bitstream.model';
import { Collection } from '../core/shared/collection.model';
import { getAllSucceededRemoteDataPayload } from '../core/shared/operators';
import {
  fadeIn,
  fadeInOut,
} from '../shared/animations/fade';
import { ThemedComcolPageBrowseByComponent } from '../shared/comcol/comcol-page-browse-by/themed-comcol-page-browse-by.component';
import { ThemedComcolPageContentComponent } from '../shared/comcol/comcol-page-content/themed-comcol-page-content.component';
import { ThemedComcolPageHandleComponent } from '../shared/comcol/comcol-page-handle/themed-comcol-page-handle.component';
import { ComcolPageHeaderComponent } from '../shared/comcol/comcol-page-header/comcol-page-header.component';
import { ComcolPageLogoComponent } from '../shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { ContextMenuComponent } from '../shared/context-menu/context-menu.component';
import { DsoEditMenuComponent } from '../shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import {
  hasValue,
  isNotEmpty,
} from '../shared/empty.util';
import { ErrorComponent } from '../shared/error/error.component';
import { ThemedLoadingComponent } from '../shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from '../shared/object-collection/object-collection.component';
import { PaginationComponentOptions } from '../shared/pagination/pagination-component-options.model';
import { VarDirective } from '../shared/utils/var.directive';
import { getCollectionPageRoute } from './collection-page-routing-paths';

@Component({
  selector: 'ds-base-collection-page',
  styleUrls: ['./collection-page.component.scss'],
  templateUrl: './collection-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeIn,
    fadeInOut,
  ],
  imports: [
    ThemedComcolPageContentComponent,
    ErrorComponent,
    NgIf,
    ThemedLoadingComponent,
    TranslateModule,
    VarDirective,
    AsyncPipe,
    ComcolPageHeaderComponent,
    ComcolPageLogoComponent,
    ThemedComcolPageHandleComponent,
    DsoEditMenuComponent,
    ThemedComcolPageBrowseByComponent,
    ObjectCollectionComponent,
    RouterOutlet,
    ContextMenuComponent,
  ],
  standalone: true,
})
export class CollectionPageComponent implements OnInit {
  collectionRD$: Observable<RemoteData<Collection>>;
  logoRD$: Observable<RemoteData<Bitstream>>;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;

  /**
   * Whether the current user is a Community admin
   */
  isCollectionAdmin$: Observable<boolean>;

  /**
   * Route to the community page
   */
  collectionPageRoute$: Observable<string>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(APP_CONFIG) public appConfig: AppConfig,
    protected route: ActivatedRoute,
    protected router: Router,
    protected authService: AuthService,
    protected authorizationDataService: AuthorizationDataService,
    public dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.collectionRD$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Collection>),
      redirectOn4xx(this.router, this.authService),
      take(1),
    );
    this.logoRD$ = this.collectionRD$.pipe(
      map((rd: RemoteData<Collection>) => rd.payload),
      filter((collection: Collection) => hasValue(collection)),
      mergeMap((collection: Collection) => collection.logo),
    );
    this.isCollectionAdmin$ = this.authorizationDataService.isAuthorized(FeatureID.IsCollectionAdmin);

    this.collectionPageRoute$ = this.collectionRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((collection) => getCollectionPageRoute(collection.id)),
    );
  }

  isNotEmpty(object: any) {
    return isNotEmpty(object);
  }


}
