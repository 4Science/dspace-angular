import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
  BehaviorSubject,
  Observable,
  Subscription,
} from 'rxjs';
import {
  map,
  reduce,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SortPipe } from 'src/app/shared/utils/sort.pipe';

import { EntityTypeDataService } from '../../core/data/entity-type-data.service';
import { FindListOptions } from '../../core/data/find-list-options.model';
import {
  buildPaginatedList,
  PaginatedList,
} from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { ItemExportFormatService } from '../../core/itemexportformat/item-export-format.service';
import { ItemType } from '../../core/shared/item-relationships/item-type.model';
import { getFirstSucceededRemoteWithNotEmptyData } from '../../core/shared/operators';
import {
  hasValue,
  isEmpty,
  isNotNull,
} from '../empty.util';
import { ThemedLoadingComponent } from '../loading/themed-loading.component';
import { createSuccessfulRemoteDataObject } from '../remote-data.utils';

@Component({
  selector: 'ds-entity-dropdown',
  templateUrl: './entity-dropdown.component.html',
  styleUrls: ['./entity-dropdown.component.scss'],
  imports: [
    AsyncPipe,
    InfiniteScrollDirective,
    SortPipe,
    ThemedLoadingComponent,
    TranslateModule,
  ],
})
export class EntityDropdownComponent implements OnInit, OnDestroy {
  /**
   * The entity list obtained from a search
   * @type {Observable<ItemType[]>}
   */
  public searchListEntity$: Observable<ItemType[]>;

  /**
   * A boolean representing if dropdown list is scrollable to the bottom
   * @type {boolean}
   */
  private scrollableBottom = false;

  /**
   * A boolean representing if dropdown list is scrollable to the top
   * @type {boolean}
   */
  private scrollableTop = false;

  /**
   * The list of entity to render
   */
  public searchListEntity: ItemType[] = [];

  /**
   * TRUE if the parent operation is a 'new submission' operation, FALSE otherwise (eg.: is an 'Import metadata from an external source'
   * operation).
   */
  @Input() isSubmission: boolean;

  /**
   * The entity to output to the parent component
   */
  @Output() selectionChange = new EventEmitter<ItemType>();

  /**
   * A boolean representing if the loader is visible or not
   */
  public isLoadingList: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * A numeric representig current page
   */
  public currentPage: number;

  /**
   * A boolean representing if exist another page to render
   */
  public hasNextPage: boolean;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  public subs: Subscription[] = [];

  /**
   * Initialize instance variables
   *
   * @param {ChangeDetectorRef} changeDetectorRef
   * @param {EntityTypeDataService} entityTypeService
   * @param {ItemExportFormatService} itemExportFormatService
   * @param {ElementRef} el
   * @param {TranslateService} translate
   */
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private entityTypeService: EntityTypeDataService,
    private translate: TranslateService,
  ) { }

  /**
   * Method called on mousewheel event, it prevent the page scroll
   * when arriving at the top/bottom of dropdown menu
   *
   * @param event
   *     mousewheel event
   */
  @HostListener('mousewheel', ['$event']) onMousewheel(event) {
    if (event.wheelDelta > 0 && this.scrollableTop) {
      event.preventDefault();
    }
    if (event.wheelDelta < 0 && this.scrollableBottom) {
      event.preventDefault();
    }
  }

  /**
   * Initialize entity list
   */
  ngOnInit() {
    this.resetPagination();
    this.populateEntityList(this.currentPage);
  }

  /**
   * Check if dropdown scrollbar is at the top or bottom of the dropdown list
   *
   * @param event
   */
  public onScroll(event) {
    this.scrollableBottom = ((event.target.scrollTop + event.target.clientHeight) === event.target.scrollHeight);
    this.scrollableTop = (event.target.scrollTop === 0);
  }

  /**
   * Method used from infitity scroll for retrieve more data on scroll down
   */
  public onScrollDown() {
    if ( this.hasNextPage ) {
      this.populateEntityList(++this.currentPage);
    }
  }

  /**
   * Emit a [selectionChange] event when a new entity is selected from list
   *
   * @param event
   *    the selected [ItemType]
   */
  public onSelect(event: ItemType) {
    this.selectionChange.emit(event);
  }

  /**
   * Method called for populate the entity list
   * @param page page number
   */
  public populateEntityList(page: number) {
    this.isLoadingList.next(true);
    let searchListEntity$: Observable<RemoteData<PaginatedList<ItemType>>>;
    // Set the pagination info
    const findOptions: FindListOptions = {
      elementsPerPage: 10,
      currentPage: page,
    };
    if (this.isSubmission) {
      searchListEntity$ =
        this.entityTypeService.getAllAuthorizedRelationshipType(findOptions);
    } else {
      searchListEntity$ =
        this.entityTypeService.getAllAuthorizedRelationshipTypeImport(findOptions);
    }

    this.searchListEntity$ = searchListEntity$.pipe(
      getFirstSucceededRemoteWithNotEmptyData(),
      map((formatTypes: RemoteData<PaginatedList<ItemType>>) =>this.parseItemTypesResponse(formatTypes)),
      tap((entityTypes) => this.hasNextPages(findOptions, entityTypes)),
      switchMap((entityType: RemoteData<PaginatedList<ItemType>>) => entityType.payload.page),
      map((item: ItemType) => {
        return {
          ...item,
          translatedLabel: this.translate.instant(`${item.label?.toLowerCase()}.listelement.badge`),
        };
      },
      ),
      reduce((acc: any, value: any) => [...acc, value], []),
      startWith([]),
    );

    this.subs.push(
      this.searchListEntity$.subscribe({
        next: (result: ItemType[]) => {
          this.searchListEntity = [...this.searchListEntity, ...result];
        },
        complete: () => { this.hideShowLoader(false); this.changeDetectorRef.detectChanges(); },
      }),
    );
  }

  private parseItemTypesResponse(formatTypes: RemoteData<PaginatedList<ItemType>>) {
    if (formatTypes.statusCode !== 200) {
      return createSuccessfulRemoteDataObject(buildPaginatedList(null, []));
    }
    const entityList: ItemType[] = (formatTypes?.payload?.page || [])
      .filter(itemType => isNotNull(itemType?.id));
    return createSuccessfulRemoteDataObject(buildPaginatedList(null, entityList));
  }

  private hasNextPages<A>(findOptions: FindListOptions, entityType: RemoteData<PaginatedList<A>>) {
    if (
      findOptions.elementsPerPage > 0 &&
      (isEmpty(entityType?.payload?.totalElements) || entityType.payload.totalElements < findOptions.elementsPerPage)
    ) {
      this.hasNextPage = false;
    } else {
      this.hasNextPage = true;
    }
  }

  /**
   * Reset pagination values
   */
  public resetPagination() {
    this.currentPage = 1;
    this.hasNextPage = true;
    this.searchListEntity = [];
  }

  /**
   * Hide/Show the entity list loader
   * @param hideShow true for show, false otherwise
   */
  public hideShowLoader(hideShow: boolean) {
    this.isLoadingList.next(hideShow);
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
