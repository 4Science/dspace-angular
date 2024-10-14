import { Component } from '@angular/core';
import {AbstractBrowseElementsComponent} from '../abstract-browse-elements.component';
import {CollectionElementLinkType} from '../../object-collection/collection-element-link.type';

@Component({
  selector: 'ds-cards-browse-elements',
  templateUrl: './cards-browse-elements.component.html',
  styleUrls: ['./cards-browse-elements.component.scss']
})
export class CardsBrowseElementsComponent extends AbstractBrowseElementsComponent {

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

}
