import { environment } from '../../../environments/environment';
import { NestedMetadataGroupEntry } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/metadata-group.component';
interface ComputedData {
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
  isConfigured: boolean;
  firstLimit: number;
  lastLimit: number;
}
interface ExtractLimits {
firstLimit: number;
lastLimit: number;
}
export class LoadMoreService  {
  /**
   * returns the limits of how many data loded from first and last
   */
  getComputedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, rendering: string): ComputedData => {
    let lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    let firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    let isConfigured = componentsToBeRenderedMap.size === 1  ? false : true ;
    const {firstLimit , lastLimit} =  this.extractLimits(rendering);
    if ((componentsToBeRenderedMap.size  <= firstLimit + lastLimit) || (!firstLimit && !lastLimit)) {
       isConfigured = false;
       firstLimitedDataToBeRenderedMap = componentsToBeRenderedMap;
    } else {
       firstLimitedDataToBeRenderedMap = this.fillFirstLimitedData(componentsToBeRenderedMap,firstLimit);
       lastLimitedDataToBeRenderedMap = this.fillLastLimitedData(componentsToBeRenderedMap,lastLimit);
    }
    return {
        firstLimitedDataToBeRenderedMap,
        lastLimitedDataToBeRenderedMap,
        isConfigured,
        firstLimit,
        lastLimit
    };
   }

  extractLimits = (rendering: string): ExtractLimits => {
    let firstLimit = 0;
    let lastLimit = 0;
    if (!rendering) {
      return {
        firstLimit,
        lastLimit
      };
    } else if (rendering.includes('more') || rendering.includes('last')) {
        if (rendering.includes('more')) {
          firstLimit = this.getLimit('more',rendering);
        } else {
          firstLimit = 0;
        }

        if (rendering.includes('last')) {
          lastLimit = this.getLimit('last',rendering);
        } else {
          lastLimit = 0;
        }
    }
    return {
      firstLimit,
      lastLimit
    };
  }

  /**
   * Get the limit of first and last loaded data from configuration or env
   */
  getLimit = (type: string, renderingData: string): number => {
    const rendering: string[]=renderingData.split('.');
    const index=rendering.findIndex((data) => data === type);
    if (rendering.length > index + 1) {
        return isNaN(Number(rendering[index + 1])) ?  this.getLimitFromEnv(type) : Number(rendering[index + 1]);
    } else {
      return  this.getLimitFromEnv(type);
    }
  }

  getLimitFromEnv = (type: string): number => {
    if (type === 'more') {
      return environment?.crisLayout?.metadataBox?.loadMore?.first ? environment?.crisLayout?.metadataBox?.loadMore?.first : 5;
    } else {
      return environment?.crisLayout?.metadataBox?.loadMore?.last ? environment?.crisLayout?.metadataBox?.loadMore?.last : 1;
    }
  }

  /**
   * fill all the data when user click on more
   */
  fillAllData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, rendering: string): ComputedData => {
    const firstLimitedDataToBeRenderedMap = componentsToBeRenderedMap;
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    const isConfigured = true;
    const {firstLimit , lastLimit} = this.extractLimits(rendering);
    return {
      firstLimitedDataToBeRenderedMap,
      lastLimitedDataToBeRenderedMap,
      isConfigured,
      firstLimit,
      lastLimit
    };
  }

  /**
   * Fill the first limited list of the metadata
   */
  fillFirstLimitedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>,firstLimit: number): Map<number, NestedMetadataGroupEntry[]> => {
    const firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = 0; i < firstLimit ; i++) {
      if (firstLimitedDataToBeRenderedMap.size < componentsToBeRenderedMap.size) {
            firstLimitedDataToBeRenderedMap.set(i,componentsToBeRenderedMap.get(i));
      }
    }
    return firstLimitedDataToBeRenderedMap;
  }

  /**
   * Fill the last limited list of thw metadeta
   */
  fillLastLimitedData = (componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>, lastLimit: number): Map<number, NestedMetadataGroupEntry[]> => {
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = componentsToBeRenderedMap.size  - lastLimit; i < componentsToBeRenderedMap.size; i++) {
            lastLimitedDataToBeRenderedMap.set(i,componentsToBeRenderedMap.get(i));
      }
    return lastLimitedDataToBeRenderedMap;
  }
}
