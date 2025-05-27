import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
  CrisLayoutBox,
  MediaBoxConfiguration,
} from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { MediaPlayerComponent } from '../../../../../shared/media-player/media-player.component';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';

@Component({
  selector: 'ds-cris-layout-media-box',
  templateUrl: './cris-layout-media-box.component.html',
  styleUrls: ['./cris-layout-media-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MediaPlayerComponent,
  ],
})
export class CrisLayoutMediaBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {
  configuration: string;

  constructor(protected translateService: TranslateService,
              @Inject('boxProvider') public boxProvider: CrisLayoutBox,
              @Inject('itemProvider') public itemProvider: Item) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configuration = (this.box.configuration as MediaBoxConfiguration)['media-configuration'];
  }

}
