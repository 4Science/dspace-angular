import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Item } from '../../../../core/shared/item.model';
import { ViewerComponent, ViewerInitialState } from '../../viewer-provider-dso.interface';

@Component({
  template: ''
})
export abstract class BaseItemViewerComponent implements ViewerComponent {

  public readonly item$: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);

  @Input()
  set item(_item: Item) {
    this.item$.next(_item);
  }
  get item(): Item {
    return this.item$.getValue();
  }

  public initialize(state: ViewerInitialState) {
    this.item = state.item;
  }

}
