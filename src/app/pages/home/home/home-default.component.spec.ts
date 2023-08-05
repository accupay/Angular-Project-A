import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeDefaultComponent } from './home-default.component';

describe('DashboadDefaultComponent', () => {
  let component: HomeDefaultComponent;
  let fixture: ComponentFixture<HomeDefaultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
