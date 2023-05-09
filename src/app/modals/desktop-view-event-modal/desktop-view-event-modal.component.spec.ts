import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesktopViewEventModalComponent } from './desktop-view-event-modal.component';

describe('DesktopViewEventModalComponent', () => {
  let component: DesktopViewEventModalComponent;
  let fixture: ComponentFixture<DesktopViewEventModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopViewEventModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopViewEventModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
