import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { VarDirective } from '../../shared/utils/var.directive';
import { CrisStatisticsPageComponent } from './cris-statistics-page.component';
import { StatisticsChartModule } from './statistics-chart/statistics-chart.module';
import { StatisticsMapComponent } from './statistics-map/statistics-map.component';
import { StatisticsPipesPageModule } from './statistics-pipes/statistics-pipes.module';

const components = [
  CrisStatisticsPageComponent,
  StatisticsMapComponent,
];

@NgModule({
  imports: [
    CommonModule,
    StatisticsChartModule.withEntryComponents(),
    HttpClientJsonpModule,
    StatisticsPipesPageModule,
    Ng2GoogleChartsModule,
    ThemedLoadingComponent,
    VarDirective,
    TranslateModule,
    FormsModule,
    NgbDatepickerModule,
    NgbNavModule,
    NgbDropdownModule,
    ...components,
  ],
  exports: components,
})
export class CrisStatisticsPageModule { }
