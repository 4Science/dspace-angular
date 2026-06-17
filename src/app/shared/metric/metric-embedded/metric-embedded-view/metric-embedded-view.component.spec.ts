import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { TranslateLoaderMock } from '@dspace/core/testing/translate-loader.mock';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { metricEmbeddedView } from 'src/app/item-page/simple/metrics/metrics-box.component.spec';

import { environment } from '../../../../../environments/environment.test';
import { MetricEmbeddedViewComponent } from './metric-embedded-view.component';

describe('MetricEmbeddedViewComponent', () => {
  let component: MetricEmbeddedViewComponent;
  let fixture: ComponentFixture<MetricEmbeddedViewComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), MetricEmbeddedViewComponent],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricEmbeddedViewComponent);
    component = fixture.componentInstance;
    component.metric = metricEmbeddedView;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
