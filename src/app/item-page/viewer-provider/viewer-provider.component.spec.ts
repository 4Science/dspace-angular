import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { AuthServiceMock } from '../../shared/mocks/auth.service.mock';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { StoreMock } from '../../shared/testing/store.mock';
import { ViewerProviderComponent } from './viewer-provider.component';

describe('ViewerProviderComponent', () => {
  let component: ViewerProviderComponent;
  let fixture: ComponentFixture<ViewerProviderComponent>;

  beforeAll(() => {
    window.onbeforeunload = () => '';
  });

  const mockBitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
    findById: createSuccessfulRemoteDataObject$(new Bitstream()),
  });


  beforeEach(async () => {
    // location = jasmine.createSpyObj('location', ['back', 'path']);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), TranslateModule.forRoot(), ViewerProviderComponent],
      providers: [
        { provide: Store, useValue: StoreMock },
        { provide: ItemDataService, useValue: {} },
        { provide: Location, useValue: new SpyLocation() },
        { provide: AuthService, useValue: new AuthServiceMock() },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
