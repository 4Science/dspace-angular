import { AsyncPipe } from '@angular/common';
import {
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  hasValue,
  hasValueOperator,
} from '@dspace/shared/utils';
import {
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  Subscription,
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { ExternalSourceDataService } from '@dspace/core';
import { PaginatedList } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { ListableObject } from '@dspace/core';
import { PaginationService } from '@dspace/core';
import { Collection } from '@dspace/core';
import { Context } from '@dspace/core';
import { ExternalSource } from '@dspace/core';
import { ExternalSourceEntry } from '@dspace/core';
import { RelationshipOptions } from '@dspace/core';
import { Item } from '@dspace/core';
import { ItemType } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';
import { PaginatedSearchOptions } from '@dspace/core';
import { PaginationComponentOptions } from '@dspace/core';
import { SearchConfigurationService } from '@dspace/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../my-dspace-page/my-dspace-configuration.service';
import {
  fadeIn,
  fadeInOut,
} from '../../../../../animations/fade';
import { ErrorComponent } from '../../../../../error/error.component';
import { ThemedLoadingComponent } from '../../../../../loading/themed-loading.component';
import { ObjectCollectionComponent } from '../../../../../object-collection/object-collection.component';
import { SelectableListService } from '@dspace/core';
import { PageSizeSelectorComponent } from '../../../../../page-size-selector/page-size-selector.component';
import { ThemedSearchFormComponent } from '../../../../../search-form/themed-search-form.component';
import { VarDirective } from '../../../../../utils/var.directive';
import { ExternalSourceEntryImportModalComponent } from './external-source-entry-import-modal/external-source-entry-import-modal.component';
import { ThemedExternalSourceEntryImportModalComponent } from './external-source-entry-import-modal/themed-external-source-entry-import-modal.component';

@Component({
  selector: 'ds-base-dynamic-lookup-relation-external-source-tab',
  styleUrls: ['./dynamic-lookup-relation-external-source-tab.component.scss'],
  templateUrl: './dynamic-lookup-relation-external-source-tab.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService,
    },
  ],
  animations: [
    fadeIn,
    fadeInOut,
  ],
  imports: [
    ThemedSearchFormComponent,
    PageSizeSelectorComponent,
    ObjectCollectionComponent,
    VarDirective,
    AsyncPipe,
    TranslateModule,
    ErrorComponent,
    ThemedLoadingComponent,
  ],
  standalone: true,
})
/**
 * Component rendering the tab content of an external source during submission lookup
 * Shows a list of entries matching the current search query with the option to import them into the repository
 */
export class DsDynamicLookupRelationExternalSourceTabComponent implements OnInit, OnDestroy {
  /**
   * The label to use for all messages (added to the end of relevant i18n keys)
   */
  @Input() label: string;

  /**
   * The ID of the list to add/remove selected items to/from
   */
  @Input() listId: string;

  /**
   * The item in submission
   */
  @Input() item: Item;

  /**
   * The collection the user is submitting an item into
   */
  @Input() collection: Collection;

  /**
   * The relationship-options for the current lookup
   */
  @Input() relationship: RelationshipOptions;

  /**
   * The context to displaying lists for
   */
  @Input() context: Context;

  /**
   * The search query
   */
  @Input() query: string;

  @Input() repeatable: boolean;
  /**
   * Emit an event when an object has been imported (or selected from similar local entries)
   */
  @Output() importedObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * The initial pagination options
   */
  initialPagination = Object.assign(new PaginationComponentOptions(), {
    id: 'spc',
    pageSize: 5,
  });

  /**
   * The current pagination options
   */
  currentPagination$: Observable<PaginationComponentOptions>;

  /**
   * The external source we're selecting entries for
   */
  @Input() externalSource: ExternalSource;

  /**
   * The displayed list of entries
   */
  entriesRD$: Observable<RemoteData<PaginatedList<ExternalSourceEntry>>>;

  /**
   * Config to use for the import buttons
   */
  importConfig;

  /**
   * The modal for importing the entry
   */
  modalRef: NgbModalRef;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   */
  protected subs: Subscription[] = [];

  /**
   * The entity types compatible with the given external source
   */
  relatedEntityType: ItemType;

  constructor(
    protected router: Router,
    public searchConfigService: SearchConfigurationService,
    protected externalSourceService: ExternalSourceDataService,
    protected modalService: NgbModal,
    protected selectableListService: SelectableListService,
    protected paginationService: PaginationService,
  ) {
  }

  /**
   * Get the entries for the selected external source
   */
  ngOnInit(): void {
    this.externalSource.entityTypes.pipe(
      getFirstCompletedRemoteData(),
      map((entityTypesRD: RemoteData<PaginatedList<ItemType>>) => {
        return (entityTypesRD.hasSucceeded && entityTypesRD.payload.totalElements > 0) ? entityTypesRD.payload.page[0] : null;
      }),
    ).subscribe((entityType: ItemType) => {
      this.relatedEntityType = entityType;
    });

    this.resetRoute();
    this.entriesRD$ = this.searchConfigService.paginatedSearchOptions.pipe(
      switchMap((searchOptions: PaginatedSearchOptions) => {
        if (searchOptions.query === '') {
          searchOptions.query = this.query;
        }
        return this.externalSourceService.getExternalSourceEntries(this.externalSource.id, searchOptions).pipe(startWith(undefined));
      }),
    );
    this.currentPagination$ = this.paginationService.getCurrentPagination(this.searchConfigService.paginationID, this.initialPagination);
    this.importConfig = {
      buttonLabel: 'submission.sections.describe.relationship-lookup.external-source.import-button-title.' + this.label,
    };
  }

  /**
   * Start the import of an entry by opening up an import modal window
   * @param entry The entry to import
   */
  import(entry) {
    this.modalRef = this.modalService.open(ThemedExternalSourceEntryImportModalComponent, {
      size: 'lg',
      container: 'ds-dynamic-lookup-relation-modal',
    });

    const modalComp$ = this.modalRef.componentInstance.compRef$.pipe(
      hasValueOperator(),
      map((compRef: ComponentRef<ExternalSourceEntryImportModalComponent>) => compRef.instance),
    );

    this.subs.push(modalComp$.subscribe((modalComp: ExternalSourceEntryImportModalComponent) => {
      modalComp.externalSourceEntry = entry;
      modalComp.item = this.item;
      // modalComp.collection = this.collection;
      modalComp.relationship = this.relationship;
      modalComp.label = this.label;
      modalComp.relatedEntityType = this.relatedEntityType;
    }));

    this.subs.push(modalComp$.pipe(
      switchMap((modalComp: ExternalSourceEntryImportModalComponent) => modalComp.importedObject),
    ).subscribe((object) => {
      this.selectableListService.selectSingle(this.listId, object);
      this.importedObject.emit(object);
    }));
  }

  /**
   * Unsubscribe from open subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

  /**
   * Method to reset the route when the tab is opened to make sure no strange pagination issues appears
   */
  resetRoute() {
    this.paginationService.updateRoute(this.searchConfigService.paginationID, {
      page: 1,
      pageSize: 5,
    });
  }
}
