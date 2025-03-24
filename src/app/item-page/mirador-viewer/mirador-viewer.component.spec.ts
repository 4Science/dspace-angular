import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MiradorViewerComponent } from './mirador-viewer.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { createRelationshipsObservable } from '../simple/item-types/shared/item.component.spec';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MetadataMap, MetadataValue } from '../../core/shared/metadata.models';
import { Item } from '../../core/shared/item.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { of as observableOf } from 'rxjs';
import { MiradorViewerService } from './mirador-viewer.service';
import { HostWindowService } from '../../shared/host-window.service';
import { BundleDataService } from '../../core/data/bundle-data.service';
import { ConfigurationProperty } from '../../core/shared/configuration-property.model';
import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { APP_CONFIG } from '../../../config/app-config.interface';
import { environment } from '../../../environments/environment';
import { Collection } from '../../core/shared/collection.model';
import { SafeUrlPipe } from '../../shared/utils/safe-url-pipe';


function getItem(metadata: MetadataMap, collectionMetadata?: MetadataMap): Item {
  return Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(createPaginatedList([])),
    metadata: metadata,
    relationships: createRelationshipsObservable(),
    owningCollection: createSuccessfulRemoteDataObject$(Object.assign(new Collection(), {metadata: collectionMetadata})),
  });
}

const noMetadata = new MetadataMap();

const mockHostWindowService = {
  // This isn't really testing mobile status, the return observable just allows the test to run.
  widthCategory: observableOf(true),
};

const defaultConfigProperty = Object.assign(new ConfigurationProperty(), {
  name: 'viewer.mirador.download.default',
  values: ['all']
});

const configurationDataService = jasmine.createSpyObj('configurationDataService', {
  findByPropertyName: createSuccessfulRemoteDataObject$(defaultConfigProperty)
});

describe('MiradorViewerComponent with search', () => {
  let comp: MiradorViewerComponent;
  let fixture: ComponentFixture<MiradorViewerComponent>;
  const viewerService = jasmine.createSpyObj('MiradorViewerService', ['showEmbeddedViewer', 'getImageCount']);

  beforeEach(waitForAsync(() => {
    viewerService.showEmbeddedViewer.and.returnValue(true);
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [MiradorViewerComponent, SafeUrlPipe],
      providers: [
        { provide: BitstreamDataService, useValue: {} },
        { provide: BundleDataService, useValue: {} },
        { provide: HostWindowService, useValue: mockHostWindowService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MiradorViewerComponent, {
      set: {
        providers: [
          { provide: MiradorViewerService, useValue: viewerService }
        ]
      }
    }).compileComponents();
  }));
  describe('searchable item', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      comp.object = getItem(noMetadata);
      comp.searchable = true;
      fixture.detectChanges();
    }));

    it('should set multi property to true', (() => {
      expect(comp.multi).toBe(true);
    }));

    it('should set url "multi" param to true', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer').src;
      expect(value).toContain('multi=true');
    }));

    it('should set url "searchable" param to true', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer').src;
      expect(value).toContain('searchable=true');
    }));

    it('should not call mirador service image count', () => {
      expect(viewerService.getImageCount).not.toHaveBeenCalled();
    });

  });
});

describe('MiradorViewerComponent with multiple images', () => {

  let comp: MiradorViewerComponent;
  let fixture: ComponentFixture<MiradorViewerComponent>;
  const viewerService = jasmine.createSpyObj('MiradorViewerService', ['showEmbeddedViewer', 'getImageCount']);

  beforeEach(waitForAsync(() => {
    viewerService.showEmbeddedViewer.and.returnValue(true);
    viewerService.getImageCount.and.returnValue(observableOf(2));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [MiradorViewerComponent, SafeUrlPipe],
      providers: [
        { provide: BitstreamDataService, useValue: {} },
        { provide: BundleDataService, useValue: {} },
        { provide: HostWindowService, useValue: mockHostWindowService  },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MiradorViewerComponent, {
      set: {
        providers: [
          { provide: MiradorViewerService, useValue: viewerService }
          ]
      }
    }).compileComponents();
  }));

  describe('non-searchable item with multiple images', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      comp.object = getItem(noMetadata);
      comp.searchable = false;
      fixture.detectChanges();
    }));

    it('should set url "multi" param to true', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer').src;
      expect(value).toContain('multi=true');
    }));

    it('should call mirador service image count', () => {
      expect(viewerService.getImageCount).toHaveBeenCalled();
    });

    it('should omit "searchable" param from url', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer').src;
      expect(value).not.toContain('searchable=true');
    }));

  });
});


describe('MiradorViewerComponent with a single image', () => {
  let comp: MiradorViewerComponent;
  let fixture: ComponentFixture<MiradorViewerComponent>;
  const viewerService = jasmine.createSpyObj('MiradorViewerService', ['showEmbeddedViewer', 'getImageCount']);

  beforeEach(waitForAsync(() => {
    viewerService.showEmbeddedViewer.and.returnValue(true);
    viewerService.getImageCount.and.returnValue(observableOf(1));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [MiradorViewerComponent, SafeUrlPipe],
      providers: [
        { provide: BitstreamDataService, useValue: {} },
        { provide: BundleDataService, useValue: {} },
        { provide: HostWindowService, useValue: mockHostWindowService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MiradorViewerComponent, {
      set: {
        providers: [
          { provide: MiradorViewerService, useValue: viewerService }
        ]
      }
    }).compileComponents();
  }));

  describe('single image viewer', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      comp.object = getItem(noMetadata);
      fixture.detectChanges();
    }));

    it('should  omit "multi" param', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer').src;
      expect(value).not.toContain('multi=false');
    }));

    it('should call mirador service image count', () => {
      expect(viewerService.getImageCount).toHaveBeenCalled();
    });

  });

});

describe('MiradorViewerComponent in development mode', () => {
  let comp: MiradorViewerComponent;
  let fixture: ComponentFixture<MiradorViewerComponent>;
  const viewerService = jasmine.createSpyObj('MiradorViewerService', ['showEmbeddedViewer', 'getImageCount']);

  beforeEach(waitForAsync(() => {
    viewerService.showEmbeddedViewer.and.returnValue(false);
    viewerService.getImageCount.and.returnValue(observableOf(1));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [MiradorViewerComponent, SafeUrlPipe],
      providers: [
        { provide: BitstreamDataService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MiradorViewerComponent, {
      set: {
        providers: [
          { provide: MiradorViewerService, useValue: viewerService },
          { provide: BundleDataService, useValue: {} },
          { provide: HostWindowService, useValue: mockHostWindowService  },
          { provide: ConfigurationDataService, useValue: configurationDataService },
          { provide: APP_CONFIG, useValue: environment },
        ]
      }
    }).compileComponents();
  }));

  describe('embedded viewer', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      comp.object = getItem(noMetadata);
      fixture.detectChanges();
    }));

    it('should not embed the viewer', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#mirador-viewer');
      expect(value).toBeNull();
    }));

    it('should show message', (() => {
      const value = fixture.debugElement
        .nativeElement.querySelector('#viewer-message');
      expect(value).not.toBeNull();
    }));

  });
});

describe('MiradorViewerComponent download plugin config', () => {

  let comp: MiradorViewerComponent;
  let fixture: ComponentFixture<MiradorViewerComponent>;
  const viewerService = jasmine.createSpyObj('MiradorViewerService', ['showEmbeddedViewer', 'getImageCount']);

  beforeEach(waitForAsync(() => {
    viewerService.showEmbeddedViewer.and.returnValue(true);
    viewerService.getImageCount.and.returnValue(observableOf(2));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      })],
      declarations: [MiradorViewerComponent, SafeUrlPipe],
      providers: [
        { provide: BitstreamDataService, useValue: {} },
        { provide: BundleDataService, useValue: {} },
        { provide: HostWindowService, useValue: mockHostWindowService  },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(MiradorViewerComponent, {
      set: {
        providers: [
          { provide: MiradorViewerService, useValue: viewerService }
        ]
      }
    }).compileComponents();
  }));


  describe('Item with metadata', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'all';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(metadataMap);
      comp.searchable = false;
      comp.getIiifDownloadConfig = () => observableOf(['all', 'single-image']);
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$([]));
      fixture.detectChanges();
    }));

    it('Download plugin should be enabled if value is "all"', ((done) => {
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be enabled if value is "single-image"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'single-image';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "no"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'no';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "alternative"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'alternative';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));
  });

  describe('Collection with metadata', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'all';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(noMetadata, metadataMap);
      comp.searchable = false;
      comp.getIiifDownloadConfig = () => observableOf(['all', 'single-image']);
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$([]));
      fixture.detectChanges();
    }));

    it('Download plugin should be enabled if value is "all"', ((done) => {
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be enabled if value is "single-image"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'single-image';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(noMetadata, metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "no"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'no';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(noMetadata, metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "alternative"', ((done) => {
      const metadataMap = new MetadataMap();
      const metadata = new MetadataValue();
      metadata.value = 'alternative';
      metadataMap[environment.mirador.downloadMetadataConfig] = [metadata];
      comp.object = getItem(noMetadata, metadataMap);
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));
  });

  describe('No metadata and no download config, only rest property', () => {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(MiradorViewerComponent);
      comp = fixture.componentInstance;
      comp.object = getItem(noMetadata);
      comp.searchable = false;
      comp.getIiifDownloadConfig = () => observableOf(['all', 'single-image']);
      fixture.detectChanges();
    }));

    it('Download plugin should be enabled if value is "all"', ((done) => {
      defaultConfigProperty.values[0] = 'all';
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$(defaultConfigProperty));
      fixture.detectChanges();
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be enabled if value is "single-image"', ((done) => {
      defaultConfigProperty.values[0] = 'single-image';
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$(defaultConfigProperty));
      fixture.detectChanges();
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(true);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "no"', ((done) => {
      defaultConfigProperty.values[0] = 'no';
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$(defaultConfigProperty));
      fixture.detectChanges();
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));

    it('Download plugin should be disabled if value is "alternative"', ((done) => {
      defaultConfigProperty.values[0] = 'alternative';
      configurationDataService.findByPropertyName.and.returnValue(createSuccessfulRemoteDataObject$(defaultConfigProperty));
      fixture.detectChanges();
      comp.isDownloadEnabled$().subscribe(enabled => {
        expect(enabled).toBe(false);
        done();
      });
    }));
  });
});

