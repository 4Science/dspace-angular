import { Directive, ElementRef, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Bitstream } from '../../core/shared/bitstream.model';
import { RemoteData } from '../../core/data/remote-data';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[dsBackgroundImage]'
})
export class BackgroundImageDirective implements OnChanges {

  @Input() dsBackgroundImage: Bitstream | RemoteData<Bitstream> | string;

  isBrowser: boolean = isPlatformBrowser(this.platformId);

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: string,
    ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.isBrowser) {
      this.setBackground();
    }
  }

  private setBackground() {
    let thumbnailSrc: string;
    if (this.dsBackgroundImage instanceof Bitstream) {
      thumbnailSrc = this.dsBackgroundImage?._links?.content?.href;
    } else if (this.dsBackgroundImage instanceof RemoteData) {
      thumbnailSrc = this.dsBackgroundImage?.payload?._links?.content?.href;
    } else {
      thumbnailSrc = this.dsBackgroundImage;
    }
    this.el.nativeElement.style.backgroundImage = `url("${thumbnailSrc ?? 'assets/images/replacement_image.svg'}")`;
    this.el.nativeElement.style.backgroundPosition = `center`;
    this.el.nativeElement.style.backgroundSize = `cover`;
    this.el.nativeElement.style.backgroundRepeat = `no-repeat`;
  }
}
