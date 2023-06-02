import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileCreateEditPredefinedEventModalComponent } from './mobile-create-edit-predefined-event-modal.component';

describe('MobileCreateEditPredefinedEventModalComponent', () => {
  let component: MobileCreateEditPredefinedEventModalComponent;
  let fixture: ComponentFixture<MobileCreateEditPredefinedEventModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCreateEditPredefinedEventModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCreateEditPredefinedEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
