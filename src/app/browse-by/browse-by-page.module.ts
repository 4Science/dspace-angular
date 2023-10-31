import { NgModule } from '@angular/core';
import { BrowseByRoutingModule } from './browse-by-routing.module';
import { BrowseByModule } from './browse-by.module';
import { ItemDataService } from '../core/data/item-data.service';
import { BrowseService } from '../core/browse/browse.service';
import { BrowseByGuard } from './browse-by-guard';
import { SharedBrowseByModule } from '../shared/browse-by/shared-browse-by.module';
import { UnpaywallItemService } from '../core/data/unpaywall-item.service';

@NgModule({
  imports: [
    SharedBrowseByModule,
    BrowseByRoutingModule,
    BrowseByModule.withEntryComponents(),
  ],
  providers: [
    ItemDataService,
    UnpaywallItemService,
    BrowseService,
    BrowseByGuard,
  ],
  declarations: [

  ]
})
export class BrowseByPageModule {

}
