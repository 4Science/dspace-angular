import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OpenStreetMapComponent } from './open-street-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { LocationService } from '../../core/services/location.service';
import { HttpClient } from '@angular/common/http';
//
describe('OpenStreetMapComponent', () => {
  let component: OpenStreetMapComponent;
  let fixture: ComponentFixture<OpenStreetMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenStreetMapComponent],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        LocationService,
        { provide: HttpClient, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenStreetMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

});
