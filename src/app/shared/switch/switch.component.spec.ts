import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import {
  SwitchColor,
  SwitchComponent,
  SwitchOption,
} from './switch.component';

describe('SwitchComponent', () => {
  let component: SwitchComponent;
  let fixture: ComponentFixture<SwitchComponent>;

  const mockOnOption: SwitchOption = {
    value: 1, icon: 'icon-1', label: 'Option 1',
    backgroundColor: SwitchColor.Success, iconColor: SwitchColor.Primary, labelColor: SwitchColor.Primary,
  };

  const mockOffOption: SwitchOption = {
    value: 2, icon: 'icon-2', label: 'Option 2',
    backgroundColor: SwitchColor.Danger, iconColor: SwitchColor.Warning, labelColor: SwitchColor.Success,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SwitchComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchComponent);
    component = fixture.componentInstance;
    component.onOption = mockOnOption;
    component.offOption = mockOffOption;
    component.selectedValue = mockOnOption.value;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render two switch options', () => {
    const optionElements = fixture.debugElement.queryAll(By.css('.switch-opt'));
    expect(optionElements.length).toBe(2);
  });

  it('should toggle from on to off and emit selected value', () => {
    spyOn(component.selectedValueChange, 'emit');

    component.onToggle();
    fixture.detectChanges();

    expect(component.selectedValue).toBe(mockOffOption.value);
    expect(component.selectedValueChange.emit).toHaveBeenCalledWith(mockOffOption.value);
  });

  it('should toggle from off to on and emit selected value', () => {
    component.selectedValue = mockOffOption.value;
    fixture.detectChanges();

    spyOn(component.selectedValueChange, 'emit');

    component.onToggle();
    fixture.detectChanges();

    expect(component.selectedValue).toBe(mockOnOption.value);
    expect(component.selectedValueChange.emit).toHaveBeenCalledWith(mockOnOption.value);
  });

  it('should apply the correct background color class for on option', () => {
    component.selectedValue = mockOnOption.value;
    component.ngOnInit();
    fixture.detectChanges();

    const containerElement = fixture.debugElement.query(By.css('.switch-container'));
    expect(containerElement.classes['bg-success']).toBeTruthy();
  });

  it('should apply the correct background color class for off option', () => {
    component.selectedValue = mockOffOption.value;
    component.ngOnInit();
    fixture.detectChanges();

    const containerElement = fixture.debugElement.query(By.css('.switch-container'));
    expect(containerElement.classes['bg-danger']).toBeTruthy();
  });

  it('should apply the correct icon color class for selected on option', () => {
    component.selectedValue = mockOnOption.value;
    fixture.detectChanges();

    const iconElement = fixture.debugElement.query(By.css('.switch-opt .icon-1'));
    expect(iconElement.classes['text-primary']).toBeTruthy();
  });

  it('should display the correct label with the selected color', () => {
    component.selectedValue = mockOffOption.value;
    component.ngOnInit();
    fixture.detectChanges();

    const labelElement = fixture.debugElement.query(By.css('.visibility-label'));
    expect(labelElement.nativeElement.textContent.trim()).toBe('Option 2');
    expect(labelElement.classes['text-success']).toBeTruthy();
  });

  it('should apply bg-white class to selected on option', () => {
    component.selectedValue = mockOnOption.value;
    fixture.detectChanges();

    const optionElements = fixture.debugElement.queryAll(By.css('.switch-opt'));
    expect(optionElements[0].classes['bg-white']).toBeTruthy();
    expect(optionElements[1].classes['bg-white']).toBeFalsy();
  });

  it('should apply bg-white class to selected off option', () => {
    component.selectedValue = mockOffOption.value;
    fixture.detectChanges();

    const optionElements = fixture.debugElement.queryAll(By.css('.switch-opt'));
    expect(optionElements[0].classes['bg-white']).toBeFalsy();
    expect(optionElements[1].classes['bg-white']).toBeTruthy();
  });

});
