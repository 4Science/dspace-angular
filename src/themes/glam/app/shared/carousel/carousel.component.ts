import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CarouselComponent as BaseComponent} from '../../../../../app/shared/carousel/carousel.component';
import { BitstreamDataService } from '../../../../../app/core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../../../../app/core/services/window.service';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import {HostWindowService} from '../../../../../app/shared/host-window.service';
import {Observable} from 'rxjs';
import {BitstreamImagesService} from '../../../../../app/core/services/bitstream-images.service';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-carousel-themed',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: []
})
export class CarouselComponent extends BaseComponent implements OnInit {

  /**
   * Time interval between transitions, in ms
   */
  carouselInterval = 6000;

  carouselHeight: string;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    private hostWindowService: HostWindowService,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    super(bitstreamDataService, bitstreamImagesService,  _window);
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (this.carouselOptions.keepAspectRatio) {
      const defaultAspectRatio = 2 / 3;
      const aspectRatio = isNaN(this.carouselOptions.aspectRatio) ? defaultAspectRatio : this.carouselOptions.aspectRatio;
      this._document.documentElement.style.setProperty('--ds-carousel-height', `calc(100vw * ${aspectRatio})`);
    } else {
      const defaultHeightPx = 680;
      const height = this.carouselOptions.carouselHeightPx ?? defaultHeightPx;
      this._document.documentElement.style.setProperty('--ds-carousel-height', `${height}px`);
    }

    this.carouselHeight = this.carouselOptions.keepAspectRatio ?
      `calc(100vw / ${ this.carouselOptions.aspectRatio})` : `${this.carouselOptions.carouselHeightPx}px`;
  }

  getBackgroundImage(href: string) {
    return this.carouselOptions.showBlurryBackdrop && href ? `url(${href})` : 'assets/images/replacement_image.svg';
  }

  isXsOrSm$(): Observable<boolean> {
    return  this.hostWindowService.isXsOrSm();
  }

}
