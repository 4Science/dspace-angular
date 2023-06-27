import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import { BaseItemViewerComponent } from './viewers/item-viewers/base-item-viewer.component';
import { BaseBitstreamViewerComponent } from './viewers/bitstream-viewers/base-bitstream-viewer.component';

export interface ViewerProvider {
  new <T extends BaseItemViewerComponent | BaseBitstreamViewerComponent>(...args: any[]);
}

export type Viewer = ViewerProvider & (BaseItemViewerComponent | BaseBitstreamViewerComponent);

export interface ViewerProviderDsoInterface {
  item?: RemoteData<Item>;
  dso?: RemoteData<Item>;
  bitstream?: RemoteData<Bitstream>;
  viewer?: ViewerProvider;
}

export interface ViewerInitialState {
  item?: Item;
  bitstream?: Bitstream;
}

export interface ViewerComponent {
  initialize(state: ViewerInitialState);
}
