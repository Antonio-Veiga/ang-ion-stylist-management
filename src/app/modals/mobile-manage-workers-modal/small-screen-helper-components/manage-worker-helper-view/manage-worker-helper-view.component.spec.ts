import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManageWorkerHelperViewComponent } from './manage-worker-helper-view.component';

describe('ManageWorkerHelperViewComponent', () => {
  let component: ManageWorkerHelperViewComponent;
  let fixture: ComponentFixture<ManageWorkerHelperViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageWorkerHelperViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageWorkerHelperViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
