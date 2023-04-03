import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DesktopCreateEditClientModalComponent } from './desktop-create-edit-client-modal.component';

describe('DesktopCreateEditClientModalComponent', () => {
  let component: DesktopCreateEditClientModalComponent;
  let fixture: ComponentFixture<DesktopCreateEditClientModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopCreateEditClientModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopCreateEditClientModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
