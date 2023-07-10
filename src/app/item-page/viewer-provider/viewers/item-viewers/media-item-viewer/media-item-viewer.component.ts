import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { BaseItemViewerComponent } from '../base-item-viewer.component';

@Component({
  selector: 'ds-media-item-viewer',
  templateUrl: './media-item-viewer.component.html',
  styleUrls: ['./media-item-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  /**
   * The bitstream uuid for which the player is shown
   */
  bitstremUUID: string;

  constructor(
    protected route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.bitstremUUID = params?.bitstream_id;
    });
  }

}
