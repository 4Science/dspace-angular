import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerProviderComponent } from './viewer-provider.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreMock } from '../../shared/testing/store.mock';
import { ItemDataService } from '../../core/data/item-data.service';
import { Location } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { AuthServiceMock } from '../../shared/mocks/auth.service.mock';
import { TranslateModule } from '@ngx-translate/core';
import { SpyLocation } from '@angular/common/testing';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';

describe('ViewerProviderComponent', () => {
  let component: ViewerProviderComponent;
  let fixture: ComponentFixture<ViewerProviderComponent>;

  beforeAll(() => {
    window.onbeforeunload = () => '';
  });

  const mockBitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
    findById: createSuccessfulRemoteDataObject$(new Bitstream())
  });


  beforeEach(async () => {
    // location = jasmine.createSpyObj('location', ['back', 'path']);
    await TestBed.configureTestingModule({
      declarations: [ ViewerProviderComponent ],
      imports: [ RouterTestingModule.withRoutes([]), TranslateModule.forRoot() ],
      providers: [
        {provide: Store, useValue: StoreMock},
        {provide: ItemDataService, useValue: {}},
        {provide: Location, useValue: new SpyLocation()},
        {provide: AuthService, useValue: new AuthServiceMock()},
        {provide: BitstreamDataService, useValue: mockBitstreamDataService}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
