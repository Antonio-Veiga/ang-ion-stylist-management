import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileCreateEditEventModalComponent } from './mobile-create-edit-event-modal.component';

describe('MobileCreateEditEventModalComponent', () => {
  let component: MobileCreateEditEventModalComponent;
  let fixture: ComponentFixture<MobileCreateEditEventModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCreateEditEventModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCreateEditEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
