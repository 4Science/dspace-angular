import { Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { getFirstSucceededRemoteDataPayload, redirectOn4xx } from '../../core/shared/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemDataService } from '../../core/data/item-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { getDSpaceQuery } from '../simple/item-types/shared/item-iiif-utils';
import { RouteService } from '../../core/services/route.service';
import { Location } from '@angular/common';

@Component({
  selector: 'ds-iiif-viewer',
  templateUrl: './iiif-viewer.component.html',
  styleUrls: ['./iiif-viewer.component.scss']
})
export class IIIFViewerComponent implements OnInit {

  item$: Observable<Item>;
  isSearchable: boolean;
  query$: Observable<string>;

  constructor(
    protected route: ActivatedRoute,
    private router: Router,
    protected routeService: RouteService,
    private items: ItemDataService,
    private authService: AuthService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.item$ = this.route.data.pipe(
      map((data) => data.dso as RemoteData<Item>),
      redirectOn4xx(this.router, this.authService),
      getFirstSucceededRemoteDataPayload(),
      tap((item) => {
        this.isSearchable = item.firstMetadataValue('iiif.search.enabled') === 'true';
        if (this.isSearchable) {
          this.query$ = getDSpaceQuery(item, this.routeService);
        }
      })
    );
  }

  back() {
    this.location.back();
  }
}
