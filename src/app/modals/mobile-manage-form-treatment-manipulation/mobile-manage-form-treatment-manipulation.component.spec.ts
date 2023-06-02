import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileManageFormTreatmentManipulationComponent } from './mobile-manage-form-treatment-manipulation.component';

describe('MobileManageFormTreatmentManipulationComponent', () => {
  let component: MobileManageFormTreatmentManipulationComponent;
  let fixture: ComponentFixture<MobileManageFormTreatmentManipulationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileManageFormTreatmentManipulationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileManageFormTreatmentManipulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
