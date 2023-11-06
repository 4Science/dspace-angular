import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { Bitstream } from '../../core/shared/bitstream.model';

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
