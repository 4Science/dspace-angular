import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DsDynamicMarkdownComponent } from './dynamic-markdown.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DsDynamicMarkdownComponent', () => {
    let component: DsDynamicMarkdownComponent;
    let fixture: ComponentFixture<DsDynamicMarkdownComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
        declarations: [DsDynamicMarkdownComponent],
        imports: [],
        providers: [],
        schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DsDynamicMarkdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize correctly', () => {
        expect(component.bindId).toBe(true);

        expect(component.blur).toBeDefined();
        expect(component.change).toBeDefined();
        expect(component.focus).toBeDefined();

        expect(component.onBlur).toBeDefined();
        expect(component.onChange).toBeDefined();
        expect(component.onFocus).toBeDefined();
    });

    it('should emit blur event', () => {
        spyOn(component.blur, 'emit');

        component.onBlur(null);

        expect(component.blur.emit).toHaveBeenCalled();
    });

    it('should emit change event', () => {
        spyOn(component.change, 'emit');

        component.onChange(null);

        expect(component.change.emit).toHaveBeenCalled();
    });

    it('should emit focus event', () => {
        spyOn(component.focus, 'emit');

        component.onFocus(null);

        expect(component.focus.emit).toHaveBeenCalled();
    });

});
