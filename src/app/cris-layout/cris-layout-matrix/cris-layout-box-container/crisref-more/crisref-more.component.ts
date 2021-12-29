import { Component, Input, OnInit } from '@angular/core';
import { NestedMetadataGroupEntry } from '../boxes/metadata/rendering-types/metadataGroup/metadata-group.component';

import { Item } from '../../../../../app/core/shared/item.model';

@Component({
  selector: 'ds-crisref-more',
  templateUrl: './crisref-more.component.html',
  styleUrls: ['./crisref-more.component.scss']
})
export class CrisrefMoreComponent implements OnInit {
  @Input() componentsToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();
  @Input() item: Item;
  @Input() limit: number;
  firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();
  lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]> = new Map<number, NestedMetadataGroupEntry[]>();


 ngOnInit(): void {
  this.fillFirstLimitedData();
  this.fillLastLimitedData();
 }

  fillFirstLimitedData() {
    const lastFill = this.firstLimitedDataToBeRenderedMap.size;
    this.firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = 0; i < this.limit + lastFill; i++) {
      if (this.firstLimitedDataToBeRenderedMap.size < this.componentsToBeRenderedMap.size - this.lastLimitedDataToBeRenderedMap.size ) {
           this.firstLimitedDataToBeRenderedMap.set(i,this.componentsToBeRenderedMap.get(i));
      }
   }
  }

  fillLastLimitedData() {
    const lastFill = this.lastLimitedDataToBeRenderedMap.size;
    this.lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    for (let i = this.componentsToBeRenderedMap.size - lastFill - this.limit; i < this.componentsToBeRenderedMap.size; i++) {
          if (i < this.firstLimitedDataToBeRenderedMap.size) {
            i = this.firstLimitedDataToBeRenderedMap.size ;
          }
          this.lastLimitedDataToBeRenderedMap.set(i,this.componentsToBeRenderedMap.get(i));

   }
  }

 }
