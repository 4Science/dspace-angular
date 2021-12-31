import { RenderingTypeStructuredModelComponent } from '../rendering-type-structured.model';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';
import { isNotEmpty } from '../../../../../../../shared/empty.util';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../../../../environments/environment';


export interface NestedMetadataGroupEntry {
  field: LayoutField;
  value: MetadataValue;
}

@Component({
  template: ''
})
export abstract class MetadataGroupComponent extends RenderingTypeStructuredModelComponent implements OnInit, OnDestroy {

  /**
   * This property is used to hold nested Layout Field inside a metadata group field
   */
  metadataGroup: LayoutField[] = [];

  /**
   * This property is used to hold a list of objects with nested Layout Field
   * and an index that shows the position of nested field inside metadata group field
   */
  componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

  /**
   * The prefix used for box field label's i18n key
   */
  fieldI18nPrefix = 'layout.field.label.';

  /**
   * A boolean representing if component is initialized
   */
  initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * This property is used to hold first limited list of metadata objects
   */
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

  /**
   * This property is used to hold last limited list of metadata objects
   */
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

  /**
   * This property is used to hold a number how many metadata objects should be loded form last
   */
  lastLimit: number;

  /**
   * This property is used to hold a number how many metadata object should be loded from first
   */
  firstLimit: number;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected translateService: TranslateService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, translateService);
  }

  ngOnInit() {
    this.field.metadataGroup.elements.forEach((entry: LayoutField) => {
      if (this.item.metadata[entry.metadata]) {
        this.metadataGroup.push(entry);
      }
    });
    this.metadataValues.forEach((mdv, index) => {
      this.metadataGroup.forEach(mdg => {
        const entry = {
          field: mdg,
          value: this.getMetadataValue(mdg, index)
        } as NestedMetadataGroupEntry;
        if (this.componentsToBeRenderedMap.has(index)) {
          const newEntries = [...this.componentsToBeRenderedMap.get(index), entry];
          this.componentsToBeRenderedMap.set(index, newEntries);
        } else {
          this.componentsToBeRenderedMap.set(index, [entry]);
        }
      });
    });

    this.initialized.next(true);
    this.setLimits();
  }

  getMetadataValue(field: LayoutField, index: number): MetadataValue {
    const metadataList = this.item.findMetadataSortedByPlace(field.metadata);
    return isNotEmpty(metadataList[index]) ? metadataList[index] : null;
  }

  /**
   * Returns a string representing the label of field if exists
   */
  getLabel(field: LayoutField): string {
    const fieldLabelI18nKey = this.fieldI18nPrefix + field.label;
    const header: string = this.translateService.instant(fieldLabelI18nKey);
    if (header === fieldLabelI18nKey) {
      // if translation does not exist return the value present in the header property
      return this.translateService.instant(field.label);
    } else {
      return header;
    }
  }

  /**
   * Set the limits of how many data loded from first and last
   */

  setLimits() {
    if (this.fieldProvider.rendering.includes('more') || this.fieldProvider.rendering.includes('last')) {
        if (this.fieldProvider.rendering.includes('more')) {
          this.firstLimit = this.getLimit('more');
          this.fillFirstLimitedData();
        } else {
          this.firstLimit = 0;
        }

        if (this.fieldProvider.rendering.includes('last')) {
          this.lastLimit = this.getLimit('last');
          this.fillLastLimitedData();
        } else {
          this.lastLimit = 0;
        }
      } else {
        this.firstLimitedDataToBeRenderedMap = this.componentsToBeRenderedMap;
      }
   }

   /**
    * Get the limit of first and last loaded data from configuration or env
    */
   getLimit(type) {
    const rendering: string[]=this.fieldProvider.rendering.split('.');
    const index=rendering.findIndex((data) => data === type);
    if (rendering.length > index + 1) {
       return isNaN(Number(rendering[index + 1])) ?  this.getLimitFromEnv(type) : Number(rendering[index + 1]);
    } else {
      return  this.getLimitFromEnv(type);
    }
   }

   getLimitFromEnv(type) {
    if (type === 'more') {
      return environment?.crisLayout?.loadMore?.first ? environment?.crisLayout?.loadMore?.first : 5;
    } else {
      return environment?.crisLayout?.loadMore?.last ? environment?.crisLayout?.loadMore?.last : 1;
    }
   }

  /**
   * Fill the first limited list of the metadata
   */
    fillFirstLimitedData() {
      const lastFill = this.firstLimitedDataToBeRenderedMap.size;
      this.firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
      for (let i = 0; i < this.firstLimit + lastFill; i++) {
        if (this.firstLimitedDataToBeRenderedMap.size < this.componentsToBeRenderedMap.size - this.lastLimitedDataToBeRenderedMap.size ) {
             this.firstLimitedDataToBeRenderedMap.set(i,this.componentsToBeRenderedMap.get(i));
        }
     }
    }

/**
 * Fill the last limited list of thw metadeta
 */
    fillLastLimitedData() {
      const lastFill = this.lastLimitedDataToBeRenderedMap.size;
      this.lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
      for (let i = this.componentsToBeRenderedMap.size - lastFill - this.lastLimit; i < this.componentsToBeRenderedMap.size; i++) {
            if (i < this.firstLimitedDataToBeRenderedMap.size) {
              i = this.firstLimitedDataToBeRenderedMap.size ;
            }
            this.lastLimitedDataToBeRenderedMap.set(i,this.componentsToBeRenderedMap.get(i));
     }
    }

  ngOnDestroy(): void {
    this.componentsToBeRenderedMap = null;
  }

}
