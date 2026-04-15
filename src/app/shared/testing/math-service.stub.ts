import { of } from 'rxjs';

export const MathServiceMock = jasmine.createSpyObj('MathService', {
  ready: jasmine.createSpy('ready').and.returnValue(of(true)),
  render: jasmine.createSpy('render'),
});
