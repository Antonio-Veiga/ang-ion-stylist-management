import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileChangeServiceModalComponent } from './mobile-change-service-modal.component';

describe('MobileChangeServiceModalComponent', () => {
  let component: MobileChangeServiceModalComponent;
  let fixture: ComponentFixture<MobileChangeServiceModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileChangeServiceModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileChangeServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
