import { Component } from '@angular/core';
import { ImagesBrowseElementsComponent } from '../images-browse-elements/images-browse-elements.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ds-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss']
})
export class SliderBrowseElementsComponent extends ImagesBrowseElementsComponent {

  readonly maxNumberOfCardsPerPage = 4;

  // private resizeObserver: ResizeObserver;

  cardsPerPage = new BehaviorSubject<number>(4); // TODO edit

  // ngAfterViewInit() {
    // this.resizeObserver = new ResizeObserver(entries => {
    //   for (let entry of entries) {
    //     // this.initialNumberOfElementsPerPage = Math.min(Math.floor(entry.contentRect.width / this.minCardWidth), this.maxNumberOfCardsPerPage);
    //     // this.changeDiscovery(this.selectedDiscoverConfiguration);
    //   }
    // });

    // this.resizeObserver.observe(this.wrapperContainer.nativeElement);
  // }

}
