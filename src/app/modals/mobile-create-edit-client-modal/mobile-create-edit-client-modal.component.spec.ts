import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileCreateEditClientModalComponent } from './mobile-create-edit-client-modal.component';

describe('MobileCreateEditClientModalComponent', () => {
  let component: MobileCreateEditClientModalComponent;
  let fixture: ComponentFixture<MobileCreateEditClientModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCreateEditClientModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCreateEditClientModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
