import {
  ChangeDetectorRef,
  Component,
  Injector,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { LinkService } from '../../../core/cache/builders/link.service';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { ActionType } from '../../../core/resource-policy/models/action-type.model';
import { PolicyType } from '../../../core/resource-policy/models/policy-type.model';
import { RESOURCE_POLICY } from '../../../core/resource-policy/models/resource-policy.resource-type';
import { ResourcePolicyDataService } from '../../../core/resource-policy/resource-policy-data.service';
import {
  createFailedRemoteDataObject,
  createSuccessfulRemoteDataObject,
} from '../../../core/utilities/remote-data.utils';
import { GroupMock } from '../../../core/utilities/testing/group-mock';
import { NotificationsServiceStub } from '../../../core/utilities/testing/notifications-service.stub';
import { RouterStub } from '../../../core/utilities/testing/router.stub';
import { createTestComponent } from '../../../core/utilities/testing/utils.test';
import { getMockLinkService } from '../../mocks/link-service.mock';
import { getMockResourcePolicyService } from '../../mocks/mock-resource-policy-service';
import {
  ResourcePolicyEvent,
  ResourcePolicyFormComponent,
} from '../form/resource-policy-form.component';
import { submittedResourcePolicy } from '../form/resource-policy-form.component.spec';
import { ResourcePolicyEditComponent } from './resource-policy-edit.component';

describe('ResourcePolicyEditComponent test suite', () => {
  let comp: ResourcePolicyEditComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<ResourcePolicyEditComponent>;
  let de;
  let scheduler: TestScheduler;
  let eventPayload: ResourcePolicyEvent;
  let updatedObject;

  const resourcePolicy: any = {
    id: '1',
    name: null,
    description: null,
    policyType: PolicyType.TYPE_SUBMISSION,
    action: ActionType.READ,
    startDate: null,
    endDate: null,
    type: 'resourcepolicy',
    uuid: 'resource-policy-1',
    _links: {
      eperson: {
        href: 'https://rest.api/rest/api/eperson',
      },
      group: {
        href: 'https://rest.api/rest/api/group',
      },
      self: {
        href: 'https://rest.api/rest/api/resourcepolicies/1',
      },
    },
    eperson: observableOf(createSuccessfulRemoteDataObject({})),
    group: observableOf(createSuccessfulRemoteDataObject(GroupMock)),
  };

  const resourcePolicyService: any = getMockResourcePolicyService();
  const linkService: any = getMockLinkService();
  const routeStub = {
    data: observableOf({
      resourcePolicy: createSuccessfulRemoteDataObject(resourcePolicy),
    }),
  };
  const routerStub = Object.assign(new RouterStub(), {
    url: `url/edit`,
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ResourcePolicyEditComponent,
        TestComponent,
      ],
      providers: [
        { provide: LinkService, useValue: linkService },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: ResourcePolicyDataService, useValue: resourcePolicyService },
        { provide: Router, useValue: routerStub },
        ResourcePolicyEditComponent,
        ChangeDetectorRef,
        Injector,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    })
      .overrideComponent(ResourcePolicyEditComponent, {
        remove: { imports: [ResourcePolicyFormComponent] },
      })
      .compileComponents();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-resource-policy-edit></ds-resource-policy-edit>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create ResourcePolicyEditComponent', inject([ResourcePolicyEditComponent], (app: ResourcePolicyEditComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {

    beforeEach(() => {
      // initTestScheduler();
      fixture = TestBed.createComponent(ResourcePolicyEditComponent);
      comp = fixture.componentInstance;
      compAsAny = fixture.componentInstance;
    });

    afterEach(() => {
      comp = null;
      compAsAny = null;
      de = null;
      fixture.destroy();
    });

    it('should init component properly', (done) => {
      fixture.detectChanges();
      expect(compAsAny.resourcePolicy).toEqual(resourcePolicy);
      done();
    });

    it('should redirect to authorizations page', (done) => {
      comp.redirectToAuthorizationsPage();
      expect(compAsAny.router.navigate).toHaveBeenCalled();
      done();
    });

    it('should return true when is Processing', (done) => {
      compAsAny.processing$.next(true);
      expect(comp.isProcessing()).toBeObservable(cold('a', {
        a: true,
      }));
      done();
    });

    it('should return false when is not Processing', (done) => {
      compAsAny.processing$.next(false);
      expect(comp.isProcessing()).toBeObservable(cold('a', {
        a: false,
      }));
      done();
    });

    describe('', () => {
      beforeEach(() => {
        spyOn(comp, 'redirectToAuthorizationsPage').and.callThrough();
        compAsAny.resourcePolicyService.update.and.returnValue(observableOf(createSuccessfulRemoteDataObject(resourcePolicy)));

        compAsAny.targetResourceUUID = 'itemUUID';

        eventPayload = Object.create({});
        eventPayload.object = submittedResourcePolicy;
        eventPayload.target = {
          type: 'group',
          uuid: GroupMock.id,
        };

        compAsAny.resourcePolicy = resourcePolicy;

        updatedObject = Object.assign({}, submittedResourcePolicy, {
          id: resourcePolicy.id,
          type: RESOURCE_POLICY.value,
          _links: resourcePolicy._links,
        });
      });

      it('should notify success when update is successful', () => {
        compAsAny.resourcePolicyService.update.and.returnValue(observableOf(createSuccessfulRemoteDataObject(resourcePolicy)));

        scheduler = getTestScheduler();
        scheduler.schedule(() => comp.updateResourcePolicy(eventPayload));
        scheduler.flush();

        expect(compAsAny.resourcePolicyService.update).toHaveBeenCalledWith(updatedObject);
        expect(comp.redirectToAuthorizationsPage).toHaveBeenCalled();
      });

      it('should notify error when update is not successful', () => {
        compAsAny.resourcePolicyService.update.and.returnValue(observableOf(createFailedRemoteDataObject()));

        scheduler = getTestScheduler();
        scheduler.schedule(() => comp.updateResourcePolicy(eventPayload));
        scheduler.flush();

        expect(compAsAny.resourcePolicyService.update).toHaveBeenCalledWith(updatedObject);
        expect(comp.redirectToAuthorizationsPage).not.toHaveBeenCalled();
      });
    });
  });

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
})
class TestComponent {

}
