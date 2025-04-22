import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialComponent } from './social.component';

@NgModule({
  declarations: [
    SocialComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    SocialComponent
  ]
})
export class SocialModule { }
