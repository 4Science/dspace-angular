import {
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { AuthInterceptor } from '../../../../../core/auth/auth.interceptor';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DspaceRestService } from '../../../../../core/dspace-rest/dspace-rest.service';
import { NativeWindowService } from '../../../../../core/services/window.service';
import { AuthServiceMock } from '../../../../../shared/mocks/auth.service.mock';
import { PdfBitstreamViewerComponent } from './pdf-bitstream-viewer.component';

describe('PdfBitstreamViewerComponent', () => {
  let component: PdfBitstreamViewerComponent;
  let fixture: ComponentFixture<PdfBitstreamViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfBitstreamViewerComponent],
      providers: [
        DspaceRestService,
        { provide: NativeWindowService, useValue: window },
        { provide: AuthService, useValue: AuthServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        { provide: HttpClient, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfBitstreamViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
