import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesktopCreateWorkerModalComponent } from './desktop-create-worker-modal.component';

describe('DesktopCreateWorkerModalComponent', () => {
  let component: DesktopCreateWorkerModalComponent;
  let fixture: ComponentFixture<DesktopCreateWorkerModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopCreateWorkerModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopCreateWorkerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
