import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Bitstream } from '../../core/shared/bitstream.model';
import { RemoteData } from '../../core/data/remote-data';

@Directive({
  selector: '[dsBackgroundBitstream]'
})
export class BackgroundBitstreamDirective implements OnChanges{

  @Input() dsBackgroundBitstream: Bitstream | RemoteData<Bitstream>;

  constructor(private el: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setBackground();
  }

  private setBackground() {
    const thumbnail = (this.dsBackgroundBitstream instanceof Bitstream) ?
      this.dsBackgroundBitstream : this.dsBackgroundBitstream?.payload;
    const thumbnailSrc = thumbnail?._links?.content?.href;
    if (thumbnailSrc) {
      this.el.nativeElement.style.backgroundImage = `url("${thumbnailSrc}")`;
      this.el.nativeElement.style.backgroundPosition = `center`;
      this.el.nativeElement.style.backgroundSize = `cover`;
      this.el.nativeElement.style.backgroundRepeat = `no-repeat`;
    }
  }
}
