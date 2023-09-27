import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagImportPageComponent } from './mag-import-page.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AdminMagImportComponent', () => {
  let component: MagImportPageComponent;
  let fixture: ComponentFixture<MagImportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagImportPageComponent ],
      imports: [ TranslateModule.forRoot() ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MagImportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
