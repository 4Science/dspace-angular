import { RemoteData } from '../../core/data/remote-data';
import { Bitstream } from '../../core/shared/bitstream.model';
import { Item } from '../../core/shared/item.model';

export interface ViewerProvider {
  new <T extends ViewerComponent>(...args: any[]);
}

export type Viewer = ViewerProvider & ViewerComponent;

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
