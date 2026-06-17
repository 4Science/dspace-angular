import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { Metric } from '@dspace/core/shared/metric.model';
import { TranslateLoaderMock } from '@dspace/core/testing/translate-loader.mock';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { metricEmbeddedDownload } from 'src/app/item-page/simple/metrics/metrics-box.component.spec';

import { environment } from '../../../../../environments/environment.test';
import { MetricEmbeddedDownloadComponent } from './metric-embedded-download.component';

describe('MetricEmbeddedDownloadComponent', () => {
  let component: MetricEmbeddedDownloadComponent;
  let fixture: ComponentFixture<MetricEmbeddedDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), MetricEmbeddedDownloadComponent],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricEmbeddedDownloadComponent);
    component = fixture.componentInstance;
    component.metric = metricEmbeddedDownload;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should append reportType to href if href is defined and does not contain query parameters', () => {
    component.href = 'http://example.com';
    component.metric = {} as Metric;
    component.ngOnInit();
    expect(component.href).toBe('http://example.com?reportType=TotalDownloads');
  });

  it('should append reportType to href if href is defined and contains query parameters', () => {
    component.href = 'http://example.com?param=value';
    component.metric = {} as Metric;
    component.ngOnInit();
    expect(component.href).toBe('http://example.com?param=value&reportType=TotalDownloads');
  });

  it('should not modify href if href is not defined', () => {
    component.href = undefined;
    component.metric = {} as Metric;
    component.ngOnInit();
    expect(component.href).toBeUndefined();
  });
});
