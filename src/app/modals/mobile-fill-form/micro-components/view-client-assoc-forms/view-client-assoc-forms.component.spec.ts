import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewClientAssocFormsComponent } from './view-client-assoc-forms.component';

describe('ViewClientAssocFormsComponent', () => {
  let component: ViewClientAssocFormsComponent;
  let fixture: ComponentFixture<ViewClientAssocFormsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewClientAssocFormsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewClientAssocFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
