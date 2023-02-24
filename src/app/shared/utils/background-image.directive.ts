import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Bitstream } from '../../core/shared/bitstream.model';
import { RemoteData } from '../../core/data/remote-data';

@Directive({
  selector: '[dsBackgroundImage]'
})
export class BackgroundImageDirective implements OnChanges {

  @Input() dsBackgroundImage: Bitstream | RemoteData<Bitstream> | string;

  constructor(private el: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setBackground();
  }

  private setBackground() {
    let thumbnailSrc: string;
    if (this.dsBackgroundImage instanceof Bitstream) {
      thumbnailSrc = this.dsBackgroundImage?._links?.content?.href;
    } else if (this.dsBackgroundImage instanceof RemoteData) {
      thumbnailSrc = this.dsBackgroundImage?.payload?._links?.content?.href;
    } else {
      thumbnailSrc = this.dsBackgroundImage ?? 'assets/images/replacement_image.svg';
    }
    if (thumbnailSrc) {
      this.el.nativeElement.style.backgroundImage = `url("${thumbnailSrc}")`;
      this.el.nativeElement.style.backgroundPosition = `center`;
      this.el.nativeElement.style.backgroundSize = `cover`;
      this.el.nativeElement.style.backgroundRepeat = `no-repeat`;
    }
  }
}
