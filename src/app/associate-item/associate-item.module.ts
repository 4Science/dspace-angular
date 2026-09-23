import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AssociateItemRoutingModule } from './associate-item-routing.module';
import { SearchModule } from '../shared/search/search.module';
import { AssociateItemPageComponent } from './associate-item-page.component';


@NgModule({
  declarations: [AssociateItemPageComponent],
  imports: [
    CommonModule,
    SharedModule.withEntryComponents(),
    AssociateItemRoutingModule,
    SearchModule.withEntryComponents()
  ]
})
export class AssociateItemModule { }
