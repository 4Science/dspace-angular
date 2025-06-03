import {
  AsyncPipe,
  DOCUMENT,
  isPlatformServer,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Observable } from 'rxjs';

import { SearchManager } from '../../../../../app/core/browse/search-manager';
import { BitstreamDataService } from '../../../../../app/core/data/bitstream-data.service';
import { InternalLinkService } from '../../../../../app/core/services/internal-link.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../../../../app/core/services/window.service';
import { BtnDisabledDirective } from '../../../../../app/shared/btn-disabled.directive';
import { CarouselComponent as BaseComponent } from '../../../../../app/shared/carousel/carousel.component';
import { HostWindowService } from '../../../../../app/shared/host-window.service';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-themed-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: [],
  standalone: true,
  imports: [
    NgbCarouselModule,
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    NgStyle,
    RouterLink,
    AsyncPipe,
    NgClass,
    TranslateModule,
    BtnDisabledDirective,
    NgxSkeletonLoaderModule,
    VarDirective,
  ],
})
export class CarouselComponent extends BaseComponent implements OnInit {

  /**
   * Time interval between transitions, in ms
   */
  carouselInterval = 6000;

  carouselHeight: string;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected searchManager: SearchManager,
    private hostWindowService: HostWindowService,
    protected internalLinkService: InternalLinkService,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    super(bitstreamDataService, searchManager, internalLinkService, _window);
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
