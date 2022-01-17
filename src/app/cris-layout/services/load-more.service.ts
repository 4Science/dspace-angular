import { environment } from 'src/environments/environment';
import { NestedMetadataGroupEntry } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/metadata-group.component';

export class LoadMoreService {
  /**
   * This property is used to hold a list of objects with nested Layout Field
   * and an index that shows the position of nested field inside metadata group field
   */
  componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();

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

  /**
   * This property is used to hold a string how many metadata object should be loded from first and last
   */
   rendering: string;

   /**
    * This property is used to hold a boolean which is used to identify .more or .last is configured or not
    */
   isConfigured: boolean;

  /**
   * Set the limits of how many data loded from first and last
   */
  setLimits() {
    this.lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    this.firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    this.isConfigured = true;
    if (this.rendering.includes('more') || this.rendering.includes('last')) {
        if (this.rendering.includes('more')) {
          this.firstLimit = this.getLimit('more');
          this.fillFirstLimitedData();
        } else {
          this.firstLimit = 0;
        }

        if (this.rendering.includes('last')) {
          this.lastLimit = this.getLimit('last');
          this.fillLastLimitedData();
        } else {
          this.lastLimit = 0;
        }
      } else {
        this.isConfigured = false;
        this.firstLimitedDataToBeRenderedMap = this.componentsToBeRenderedMap;
      }
   }

   /**
    * Get the limit of first and last loaded data from configuration or env
    */
   getLimit(type) {
    const rendering: string[]=this.rendering.split('.');
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
 * fill all the data when user click on more
 */
   fillAllData() {
    this.firstLimitedDataToBeRenderedMap = this.componentsToBeRenderedMap;
    this.lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
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

    setData(componentsToBeRenderedMap, rendering) {
        this.componentsToBeRenderedMap = componentsToBeRenderedMap;
        this.rendering = rendering;
    }
}
