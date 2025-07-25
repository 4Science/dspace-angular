import {
  DebugElement,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { of } from 'rxjs';

import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { ConfigurationDataService } from '../../../../../../../core/data/configuration-data.service';
import { AuthorizationDataService } from '../../../../../../../core/data/feature-authorization/authorization-data.service';
import { Item } from '../../../../../../../core/shared/item.model';
import {
  bitstreamOrignialWithMetadata,
  bitstreamWithoutThumbnail,
  bitstreamWithThumbnail,
  bitstreamWithThumbnailWithMetadata,
  mockThumbnail,
  mockThumbnailWithType,
} from '../../../../../../../shared/mocks/bitstreams.mock';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../../../../../../shared/remote-data.utils';
import { TranslateLoaderMock } from '../../../../../../../shared/testing/translate-loader.mock';
import { createPaginatedList } from '../../../../../../../shared/testing/utils.test';
import { ThumbnailService } from '../../../../../../../shared/thumbnail/thumbnail.service';
import { ThemedThumbnailComponent } from '../../../../../../../thumbnail/themed-thumbnail.component';
import { FieldRenderingType } from '../field-rendering-type';
import { ThumbnailRenderingComponent } from './thumbnail.component';

describe('', () => {
  let component: ThumbnailRenderingComponent;
  let fixture: ComponentFixture<ThumbnailRenderingComponent>;
  let de: DebugElement;

  const testItem = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.identifier.doi': [
        {
          value: 'doi:10.1392/dironix',
        },
      ],
    },
    entityType: 'Person',
  });

  const mockField = Object.assign({
    id: 1,
    label: 'Field Label',
    metadata: 'dc.identifier.doi',
    rendering: FieldRenderingType.THUMBNAIL,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'font-weight-bold col-3',
    styleValue: null,
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: null,
      metadataValue: null,
    },
  });

  const mockField1 = Object.assign({
    id: 1,
    label: 'Field Label',
    metadata: 'dc.identifier.doi',
    rendering: FieldRenderingType.THUMBNAIL,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'font-weight-bold col-3',
    styleValue: null,
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: 'dc.type',
      metadataValue: 'personal picture',
    },
  });

  const mockBitstreamDataService = jasmine.createSpyObj('BitstreamDataService', {
    findByItem: jasmine.createSpy('findByItem'),
  });

  const mockAuthorizedService = jasmine.createSpyObj('AuthorizationDataService', {
    isAuthorized: jasmine.createSpy('isAuthorized'),
  });

  const mockThumbnailService = jasmine.createSpyObj('ThumbnailService', {
    getConfig: jasmine.createSpy('getConfig'),
  });

  const getDefaultTestBedConf = (fieldProvider) => {
    return {
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        ThumbnailRenderingComponent,
      ],
      providers: [
        { provide: 'fieldProvider', useValue: fieldProvider },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: AuthorizationDataService, useValue: mockAuthorizedService },
        { provide: ConfigurationDataService, useValue: {} },
        { provide: ThumbnailService, useValue: mockThumbnailService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    };
  };

  describe('When there is no metadata field to check', () => {

    // waitForAsync beforeEach
    beforeEach(waitForAsync(() => {
      return TestBed.configureTestingModule(getDefaultTestBedConf(mockField))
        .overrideComponent(ThumbnailRenderingComponent, {
          remove: {
            imports: [
              ThemedThumbnailComponent,
            ],
          },
        });
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ThumbnailRenderingComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;
      mockBitstreamDataService.findByItem.and.returnValues(createSuccessfulRemoteDataObject$(createPaginatedList([])));
      mockThumbnailService.getConfig.and.returnValue(of(createSuccessfulRemoteDataObject(null)));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('findByItem should have been called', () => {
      expect(mockBitstreamDataService.findByItem).toHaveBeenCalled();
    });

    describe('When bitstreams are empty', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('check metadata rendering', fakeAsync(() => {
        const thumbnail = fixture.debugElement.query(By.css('[data-test="thumbnail"]'));
        expect(thumbnail).toBeTruthy();
      }));

      it('should show default thumbnail', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });
    });

    describe('When bitstreams are only original', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([bitstreamWithoutThumbnail])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('check metadata rendering', fakeAsync(() => {
        const thumbnail = fixture.debugElement.query(By.css('[data-test="thumbnail"]'));
        expect(thumbnail).toBeTruthy();
      }));

      it('should show default thumbnail', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });
    });

    describe('When bitstreams are only thumbnail', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([bitstreamWithThumbnail])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('check metadata rendering', fakeAsync(() => {
        const thumbnail = fixture.debugElement.query(By.css('[data-test="thumbnail"]'));
        expect(thumbnail).toBeTruthy();
      }));

      it('should show thumbnail content image src', () => {
        expect(component.thumbnail$.value).toEqual(mockThumbnail);
      });

    });

  });


  describe('When there is dc.type metadata field to check', () => {

    // waitForAsync beforeEach
    beforeEach(waitForAsync(() => {
      return TestBed.configureTestingModule(getDefaultTestBedConf(mockField1))
        .overrideComponent(ThumbnailRenderingComponent, {
          remove: {
            imports: [
              ThemedThumbnailComponent,
            ],
          },
        });
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ThumbnailRenderingComponent);
      component = fixture.componentInstance;
      de = fixture.debugElement;
      mockBitstreamDataService.findByItem.and.returnValue(of([]));
      mockThumbnailService.getConfig.and.returnValue(of(createSuccessfulRemoteDataObject(null)));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('findByItem should have been called', () => {
      expect(mockBitstreamDataService.findByItem).toHaveBeenCalled();
    });

    describe('When bitstreams are empty', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('check metadata rendering', () => {
        const thumbnail = fixture.debugElement.query(By.css('[data-test="thumbnail"]'));
        expect(thumbnail).toBeTruthy();
      });

      it('should show default thumbnail', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });
    });

    describe('When bitstreams are only original without the right metadata information', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([bitstreamWithoutThumbnail])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('should not show bitstream content image src but the default image', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });

    });

    describe('When bitstreams are thumbnail of original without the right metadata information', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('should not show thumbnail content image src but the default image', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });
    });

    describe('When bitstreams are only original with the right metadata information', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([bitstreamOrignialWithMetadata])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('should not show thumbnail content image src but the default image', (done) => {
        component.default$.subscribe(image => {
          expect(image).toBe('assets/images/file-placeholder.svg');
          done();
        });
      });

    });

    describe('When bitstreams thumbnail of original bitsream with the right metadata information', () => {

      beforeEach(() => {
        const spy = spyOn(component, 'getBitstreamsByItem');
        spy.and.returnValue(of(createPaginatedList([bitstreamWithThumbnailWithMetadata])));
        component.ngOnInit();
        fixture.detectChanges();
      });

      it('should show thumbnail content image src', () => {
        /*        expect(component.default).toBe('assets/images/file-placeholder.svg');
        const image = fixture.debugElement.query(By.css('img[src="http://localhost:8080/server/api/core/bitstreams/thumbnail-6df9-40ef-9009-b3c90a4e6d5b/content"]'));
        expect(image).toBeTruthy();*/
        expect(component.thumbnail$.value).toEqual(mockThumbnailWithType);
      });

    });

  });

});
