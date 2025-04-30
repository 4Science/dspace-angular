/* tslint:disable:no-unused-variable */
import { EventEmitter } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  of as observableOf,
  of,
} from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FileService } from '../../../core/shared/file.service';
import { ThemedLoadingComponent } from '../../loading/themed-loading.component';
import { MetadataLinkViewAvatarPopoverComponent } from './metadata-link-view-avatar-popover.component';

describe('MetadataLinkViewAvatarPopoverComponent', () => {
  let component: MetadataLinkViewAvatarPopoverComponent;
  let fixture: ComponentFixture<MetadataLinkViewAvatarPopoverComponent>;
  let authService;
  let authorizationService;
  let fileService;
  let translateServiceStub;

  beforeEach(waitForAsync(() => {
    authService = jasmine.createSpyObj('AuthService', {
      isAuthenticated: observableOf(true),
    });
    authorizationService = jasmine.createSpyObj('AuthorizationService', {
      isAuthorized: observableOf(true),
    });
    fileService = jasmine.createSpyObj('FileService', {
      retrieveFileDownloadLink: null,
    });
    translateServiceStub = {
      get: () => of('translated-text'),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    TestBed.configureTestingModule({
      imports: [MetadataLinkViewAvatarPopoverComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: FileService, useValue: fileService },
        { provide: TranslateService, useValue: translateServiceStub },
      ],
    })
      .overrideComponent(MetadataLinkViewAvatarPopoverComponent, { remove: { imports: [ThemedLoadingComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataLinkViewAvatarPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set placeholder image based on entity type', () => {
    component.entityType = 'testEntityType';
    component.ngOnInit();
    expect(component.placeholderImageUrl).toBe('assets/images/testentitytype-placeholder.svg');
  });
});
