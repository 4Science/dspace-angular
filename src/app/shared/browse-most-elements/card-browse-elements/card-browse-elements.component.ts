import { AdvancedTopSection } from './../../../core/layout/models/section.model';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ImageBrowseElementsComponent } from '../image-browse-elements/image-browse-elements.component';

@Component({
  selector: 'ds-card-browse-elements',
  templateUrl: './card-browse-elements.component.html',
  styleUrls: ['./card-browse-elements.component.scss']
})
export class CardBrowseElementsComponent extends ImageBrowseElementsComponent implements OnInit, OnChanges {

  @Input() advancedTopSection: AdvancedTopSection;

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // avoid calling super.ngOnInit() to avoid calling the browseService
  }

  ngOnChanges(): void {
    super.ngOnInit();
  }
}
