import { Component, Input } from '@angular/core';
import { Bitstream } from '../../../../core/shared/bitstream.model';
import { ViewerComponent, ViewerInitialState } from '../../viewer-provider-dso.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  template: '',
})
export abstract class BaseBitstreamViewerComponent implements ViewerComponent {

  public readonly bitstream$: BehaviorSubject<Bitstream> = new BehaviorSubject<Bitstream>(null);

  @Input()
  set bitstream(_bitstream: Bitstream) {
    this.bitstream$.next(_bitstream);
  }
  get bitstream(): Bitstream {
    return this.bitstream$.getValue();
  }

  public initialize(state: ViewerInitialState) {
    this.bitstream = state.bitstream;
  }
}
