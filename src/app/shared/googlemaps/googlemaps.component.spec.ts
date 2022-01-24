import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { GooglemapsComponent } from './googlemaps.component';

describe('GooglemapsComponent', () => {

  let component: GooglemapsComponent;

  let fixture: ComponentFixture<GooglemapsComponent>;

  const coordinates ='@41.3455,456.67';

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: jasmine.createSpy('findByPropertyName')
  });

  const confResponse$ = createSuccessfulRemoteDataObject$({ values: ['valid-googlemap-key'] });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GooglemapsComponent ],
      providers: [
      { provide: ConfigurationDataService, useValue: configurationDataService },
      ]
    })
    .compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = coordinates;
    configurationDataService.findByPropertyName.and.returnValues(confResponse$);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should rendered google map.',() => {
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeTruthy();
  });

  it('should not rendered google map.',() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = '';
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeFalsy();
  });
});
