import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OtpCheckComponent } from './otp-check.component';

describe('SigninComponent', () => {
  let component: OtpCheckComponent;
  let fixture: ComponentFixture<OtpCheckComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OtpCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtpCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
