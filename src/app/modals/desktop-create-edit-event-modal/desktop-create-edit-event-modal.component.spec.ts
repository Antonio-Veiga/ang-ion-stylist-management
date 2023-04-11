import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesktopCreateEditEventModalComponent } from './desktop-create-edit-event-modal.component';

describe('DesktopCreateEditEventModalComponent', () => {
  let component: DesktopCreateEditEventModalComponent;
  let fixture: ComponentFixture<DesktopCreateEditEventModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopCreateEditEventModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopCreateEditEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
