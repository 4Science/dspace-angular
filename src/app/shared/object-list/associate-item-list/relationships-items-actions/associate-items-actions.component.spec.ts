import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateItemsActionsComponent } from './associate-items-actions.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../mocks/translate-loader.mock';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('AssociateItemsActionsComponent', () => {
  let component: AssociateItemsActionsComponent;
  let fixture: ComponentFixture<AssociateItemsActionsComponent>;
  let store: Store<AppState>;
  let mockStore: MockStore<AppState>;

  const initialState = {
    editItemRelationships: {
      pendingChanges: true
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociateItemsActionsComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    store = TestBed.inject(Store);
    mockStore = store as MockStore<AppState>;
    fixture = TestBed.createComponent(AssociateItemsActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
