import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CcLicenseSmallComponent } from './cc-license-small.component';

fdescribe('CcLicenseSmallComponent', () => {
  let component: CcLicenseSmallComponent;
  let fixture: ComponentFixture<CcLicenseSmallComponent>;

  const mockItem = {
    firstMetadataValue: jasmine.createSpy('firstMetadataValue').and.returnValue(''),
    metadata: {},
    findMetadataSortedByPlace: jasmine.createSpy('findMetadataSortedByPlace').and.returnValue([]),
  };

  const mockField = {
    metadataGroup: { elements: [] },
    styleValue: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [CcLicenseSmallComponent],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: mockItem },
        { provide: 'metadataValueProvider', useValue: {} },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CcLicenseSmallComponent);
    component = fixture.componentInstance;

    component.componentsToBeRenderedMap.set(0, [
      { field: { metadata: 'dc.rights' } as any, value: {} as any },
      { field: { metadata: 'dc.rights.uri' } as any, value: {} as any },
    ] as any);

    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
