import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileManageWorkersModalComponent } from './mobile-manage-workers-modal.component';

describe('MobileManageWorkersModalComponent', () => {
  let component: MobileManageWorkersModalComponent;
  let fixture: ComponentFixture<MobileManageWorkersModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileManageWorkersModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileManageWorkersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
