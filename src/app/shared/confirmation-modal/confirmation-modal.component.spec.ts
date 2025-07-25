import {
  DebugElement,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;
  let debugElement: DebugElement;

  const modalStub = jasmine.createSpyObj('modalStub', ['close']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ConfirmationModalComponent],
      providers: [
        { provide: NgbActiveModal, useValue: modalStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('close', () => {
    beforeEach(() => {
      component.close();
    });
    it('should call the close method on the active modal', () => {
      expect(modalStub.close).toHaveBeenCalled();
    });
  });

  describe('confirmPressed', () => {
    beforeEach(() => {
      spyOn(component.response, 'emit');
      component.confirmPressed();
    });
    it('should call the close method on the active modal', () => {
      expect(modalStub.close).toHaveBeenCalled();
    });
    it('behaviour subject should emit true', () => {
      expect(component.response.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('cancelPressed', () => {
    beforeEach(() => {
      spyOn(component.response, 'emit');
      component.cancelPressed();
    });
    it('should call the close method on the active modal', () => {
      expect(modalStub.close).toHaveBeenCalled();
    });
    it('behaviour subject should emit false', () => {
      expect(component.response.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('when the click method emits on close button', () => {
    beforeEach(fakeAsync(() => {
      spyOn(component, 'close');
      debugElement.query(By.css('button.close')).triggerEventHandler('click', {
        preventDefault: () => {/**/
        },
      });
      tick();
      fixture.detectChanges();
    }));
    it('should call the close method on the component', () => {
      expect(component.close).toHaveBeenCalled();
    });
  });

  describe('when the click method emits on cancel button', () => {
    beforeEach(fakeAsync(() => {
      spyOn(component, 'close');
      spyOn(component.response, 'emit');
      debugElement.query(By.css('button.cancel')).triggerEventHandler('click', {
        preventDefault: () => {/**/
        },
      });
      tick();
      fixture.detectChanges();
    }));
    it('should call the close method on the component', () => {
      expect(component.close).toHaveBeenCalled();
    });
    it('behaviour subject should emit false', () => {
      expect(component.response.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('when the click method emits on confirm button', () => {
    beforeEach(fakeAsync(() => {
      spyOn(component, 'close');
      spyOn(component.response, 'emit');
      debugElement.query(By.css('button.confirm')).triggerEventHandler('click', {
        preventDefault: () => {/**/
        },
      });
      tick();
      fixture.detectChanges();
    }));
    it('should call the close method on the component', () => {
      expect(component.close).toHaveBeenCalled();
    });
    it('behaviour subject should emit false', () => {
      expect(component.response.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('displaying the name in the modal', () => {
    const testName = 'Test Name';
    beforeEach(() => {
      component.name = testName;
      component.headerLabel = `Header: ${component.name}`;
      component.infoLabel = `Info: ${component.name}`;
      component.cancelLabel = `Cancel: ${component.name}`;
      component.confirmLabel = `Confirm: ${component.name}`;
      fixture.detectChanges();
    });
    it('should display the name in the header', () => {
      const header = debugElement.query(By.css('.modal-header')).nativeElement.textContent;
      expect(header).toContain(testName);
    });
    it('should display the name in the body', () => {
      const body = debugElement.query(By.css('.modal-body')).nativeElement.textContent;
      expect(body).toContain(testName);
    });
    it('should display the name in the cancel button', () => {
      const cancelBtn = debugElement.query(By.css('button.cancel')).nativeElement.textContent;
      expect(cancelBtn).toContain(testName);
    });
    it('should display the name in the confirm button', () => {
      const confirmBtn = debugElement.query(By.css('button.confirm')).nativeElement.textContent;
      expect(confirmBtn).toContain(testName);
    });
  });

});
