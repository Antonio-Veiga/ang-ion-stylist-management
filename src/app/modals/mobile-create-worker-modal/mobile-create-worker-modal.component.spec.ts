import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileCreateWorkerModalComponent } from './mobile-create-worker-modal.component';

describe('MobileCreateWorkerModalComponent', () => {
  let component: MobileCreateWorkerModalComponent;
  let fixture: ComponentFixture<MobileCreateWorkerModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileCreateWorkerModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileCreateWorkerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
