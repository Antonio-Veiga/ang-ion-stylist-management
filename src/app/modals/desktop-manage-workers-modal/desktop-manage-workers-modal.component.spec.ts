import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesktopManageWorkersModalComponent } from './desktop-manage-workers-modal.component';

describe('DesktopManageWorkersModalComponent', () => {
  let component: DesktopManageWorkersModalComponent;
  let fixture: ComponentFixture<DesktopManageWorkersModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopManageWorkersModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopManageWorkersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
