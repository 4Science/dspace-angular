import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GooglemapsGroupComponent } from './googlemaps-group.component';
import { Item } from '../../../../../../../../core/shared/item.model';
import { of } from 'rxjs';
import { LayoutField } from '../../../../../../../../core/layout/models/box.model';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../../../../shared/mocks/translate-loader.mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadMoreService } from '../../../../../../../services/load-more.service';
import { GooglemapsComponent } from '../../../../../../../../shared/googlemaps/googlemaps.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigurationDataService } from '../../../../../../../../core/data/configuration-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../../shared/remote-data.utils';

describe('GooglemapsGroupComponent', () => {
  let component: GooglemapsGroupComponent;

  let fixture: ComponentFixture<GooglemapsGroupComponent>;

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: jasmine.createSpy('findByPropertyName')
  });

  const confResponse$ = createSuccessfulRemoteDataObject$({ values: ['valid-googlemap-key'] });

  const testItem = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.coverage.spatialgpdpy': [
        {
          value: '45.4899793'
        },
      ],
      'dc.coverage.spatialgpdpx': [
        {
          value: '9.138292'
        },
      ]
    }
  });

  const mockField = Object.assign({
    id: 1,
    fieldType: 'METADATAGROUP',
    metadata: 'dc.coverage.spatialgpdpy',
    label: 'Coordinates',
    rendering: 'googlemaps-group',
    style: 'container row',
    styleLabel: 'font-weight-bold col-4',
    styleValue: 'col',
    metadataGroup: {
      leading: 'dc.coverage.spatialgpdpy',
      elements: [
        {
          metadata: 'dc.coverage.spatialgpdpy',
          label: 'Latitude',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        },
        {
          metadata: 'dc.coverage.spatialgpdpx',
          label: 'Longitude',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        }
      ]
    }
  }) as LayoutField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: 'tabNameProvider', useValue: '' },
        LoadMoreService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [
        GooglemapsGroupComponent,
        GooglemapsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GooglemapsGroupComponent);
    component = fixture.componentInstance;
    configurationDataService.findByPropertyName.and.returnValues(confResponse$);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate coordinates', () => {
    expect(component.coordinates).not.toBeUndefined();
    const latitude = testItem.metadata['dc.coverage.spatialgpdpy'][0].value;
    const longitude = testItem.metadata['dc.coverage.spatialgpdpx'][0].value;
    expect(component.coordinates).toBe(`@${latitude},${longitude}`);
  });
});
