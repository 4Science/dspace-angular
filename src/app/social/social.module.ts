import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialComponent } from './social.component';
import { TranslateModule } from '@ngx-translate/core';

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
