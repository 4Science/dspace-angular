import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  zip as observableZip,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { BrowseService } from '@dspace/core';
import { BrowseDefinitionDataService } from '@dspace/core';
import { RelationshipDataService } from '@dspace/core';
import { MetadataService } from '@dspace/core';
import { Item } from '@dspace/core';
import { MetadataValue } from '@dspace/core';
import { MetadataRepresentation } from '@dspace/core';
import { MetadatumRepresentation } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';
import { ThemedLoadingComponent } from '../../../shared/loading/themed-loading.component';
import { MetadataFieldWrapperComponent } from '../../../shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { MetadataRepresentationLoaderComponent } from '../../../shared/metadata-representation/metadata-representation-loader.component';
import { VarDirective } from '../../../shared/utils/var.directive';
import { AbstractIncrementalListComponent } from '../abstract-incremental-list/abstract-incremental-list.component';

@Component({
  selector: 'ds-base-metadata-representation-list',
  templateUrl: './metadata-representation-list.component.html',
  standalone: true,
  imports: [MetadataFieldWrapperComponent, VarDirective, MetadataRepresentationLoaderComponent, ThemedLoadingComponent, AsyncPipe, TranslateModule],
})
/**
 * This component is used for displaying metadata
 * It expects an item and a metadataField to fetch metadata
 * It expects an itemType to resolve the metadata to a an item
 * It expects a label to put on top of the list
 */
export class MetadataRepresentationListComponent extends AbstractIncrementalListComponent<Observable<MetadataRepresentation[]>> {
  /**
   * The parent of the list of related items to display
   */
  @Input() parentItem: Item;

  /**
   * The type of item to create a representation of
   */
  @Input() itemType: string;

  /**
   * The metadata field to use for fetching metadata from the item
   */
  @Input() metadataFields: string[];

  /**
   * An i18n label to use as a title for the list
   */
  @Input() label: string;

  /**
   * The amount to increment the list by when clicking "view more"
   * Defaults to 10
   * The default can optionally be overridden by providing the limit as input to the component
   */
  @Input() incrementBy = 10;

  /**
   * The total amount of metadata values available
   */
  total: number;

  constructor(
    public relationshipService: RelationshipDataService,
    protected browseDefinitionDataService: BrowseDefinitionDataService,
    protected metadataService: MetadataService,
  ) {
    super();
  }

  /**
   * Get a specific page
   * @param page  The page to fetch
   */
  getPage(page: number): Observable<MetadataRepresentation[]> {
    const metadata = this.parentItem.findMetadataSortedByPlace(this.metadataFields);
    this.total = metadata.length;
    return this.resolveMetadataRepresentations(metadata, page);
  }

  /**
   * Resolve a list of metadata values to a list of metadata representations
   * @param metadata  The list of all metadata values
   * @param page      The page to return representations for
   */
  resolveMetadataRepresentations(metadata: MetadataValue[], page: number): Observable<MetadataRepresentation[]> {
    return observableZip(
      ...metadata
        .slice((this.objects.length * this.incrementBy), (this.objects.length * this.incrementBy) + this.incrementBy)
        .map((metadatum: any) => Object.assign(new MetadataValue(), metadatum))
        .map((metadatum: MetadataValue) => {
          if (this.metadataService.isVirtual(metadatum)) {
            return this.relationshipService.resolveMetadataRepresentation(metadatum, this.parentItem, this.itemType);
          } else {
            // Check for a configured browse link and return a standard metadata representation
            let searchKeyArray: string[] = [];
            this.metadataFields.forEach((field: string) => {
              searchKeyArray = searchKeyArray.concat(BrowseService.toSearchKeyArray(field));
            });
            return this.browseDefinitionDataService.findByFields(this.metadataFields).pipe(
              getFirstCompletedRemoteData(),
              map((def) => Object.assign(new MetadatumRepresentation(this.itemType, def.payload), metadatum)),
            );
          }
        }),
    );
  }
}
