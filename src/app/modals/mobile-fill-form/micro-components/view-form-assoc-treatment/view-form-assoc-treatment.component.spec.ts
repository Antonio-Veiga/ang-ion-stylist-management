import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewFormAssocTreatmentComponent } from './view-form-assoc-treatment.component';

describe('ViewFormAssocTreatmentComponent', () => {
  let component: ViewFormAssocTreatmentComponent;
  let fixture: ComponentFixture<ViewFormAssocTreatmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFormAssocTreatmentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewFormAssocTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
