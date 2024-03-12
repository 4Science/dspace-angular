import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '../../../../../config/app-config.interface';
import { environment } from '../../../../../environments/environment.test';
import { ActivatedRouteStub } from '../../../testing/active-router.stub';
import { ComcolSearchSectionComponent } from './comcol-search-section.component';

describe('ComcolSearchSectionComponent', () => {
  let component: ComcolSearchSectionComponent;
  let fixture: ComponentFixture<ComcolSearchSectionComponent>;

  let route: ActivatedRouteStub;

  beforeEach(async () => {
    route = new ActivatedRouteStub();

    await TestBed.configureTestingModule({
    imports: [ComcolSearchSectionComponent],
    providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: ActivatedRoute, useValue: route },
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ComcolSearchSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
