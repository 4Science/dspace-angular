import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { SafeUrlPipe } from '../../../../app/shared/utils/safe-url-pipe';
import { VarDirective } from '../../../../app/shared/utils/var.directive';
import { ThumbnailComponent as BaseComponent } from '../../../../app/thumbnail/thumbnail.component';
import {NgxSkeletonLoaderModule} from "ngx-skeleton-loader";

@Component({
  selector: 'ds-themed-thumbnail',
  // styleUrls: ['./thumbnail.component.scss'],
  styleUrls: ['../../../../app/thumbnail/thumbnail.component.scss'],
  // templateUrl: './thumbnail.component.html',
  templateUrl: '../../../../app/thumbnail/thumbnail.component.html',
  standalone: true,
  imports: [VarDirective, CommonModule, ThemedLoadingComponent, TranslateModule, SafeUrlPipe, NgxSkeletonLoaderModule],
})
export class ThumbnailComponent extends BaseComponent {
}
