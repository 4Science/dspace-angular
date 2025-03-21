import { DOCUMENT } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { SocialComponent } from './social.component';
import { SocialService } from './social.service';

describe('SocialComponent', () => {
  let component: SocialComponent;
  let fixture: ComponentFixture<SocialComponent>;
  let document: Document;

  const socialServiceStub = {};

  const activatedRouteStub = {} as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), SocialComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: SocialService, useValue: socialServiceStub },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SocialComponent);
    component = fixture.componentInstance;
    document = TestBed.inject(DOCUMENT) as any;
    fixture.detectChanges();
  });

  it('should create socialComponent', () => {
    expect(component).toBeTruthy();
  });

});
