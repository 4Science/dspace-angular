import { Component, Input, OnInit } from '@angular/core';
import { NestedMetadataGroupEntry } from '../boxes/metadata/rendering-types/metadataGroup/metadata-group.component';
import { Item } from '../../../../../app/core/shared/item.model';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'ds-crisref-more',
  templateUrl: './crisref-more.component.html',
  styleUrls: ['./crisref-more.component.scss']
})
export class CrisrefMoreComponent implements OnInit {
  @Input() componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();
  @Input() item: Item;
  @Input() rendering: string;
  @Input() renderingType: string;
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();
  lastLimit: number;
  firstLimit: number;

 ngOnInit(): void {
  this.setLimits();
 }

setLimits() {
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
      this.firstLimitedDataToBeRenderedMap = this.componentsToBeRenderedMap;
    }
 }

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
    return 5;
  } else {
    return 5;
  }
 }



  fillFirstLimitedData() {
    const lastFill = this.firstLimitedDataToBeRenderedMap.size;
    this.firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = 0; i < this.firstLimit + lastFill; i++) {
      if (this.firstLimitedDataToBeRenderedMap.size < this.componentsToBeRenderedMap.size - this.lastLimitedDataToBeRenderedMap.size ) {
           this.firstLimitedDataToBeRenderedMap.set(i,this.componentsToBeRenderedMap.get(i));
      }
   }
  }

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

 }
