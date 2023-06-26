import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfBitstreamViewerComponent } from './pdf-bitstream-viewer.component';
import { NativeWindowService } from '../../../../../core/services/window.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AuthServiceMock } from '../../../../../shared/mocks/auth.service.mock';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DspaceRestService } from '../../../../../core/dspace-rest/dspace-rest.service';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from '../../../../../core/auth/auth.interceptor';

describe('PdfBitstreamViewerComponent', () => {
  let component: PdfBitstreamViewerComponent;
  let fixture: ComponentFixture<PdfBitstreamViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfBitstreamViewerComponent ],
      providers: [
        DspaceRestService,
        {provide: NativeWindowService, useValue: window},
        {provide: AuthService, useValue: AuthServiceMock},
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {provide: HttpClient, useValue: {}}
      ],
      schemas: [NO_ERRORS_SCHEMA]
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
