import { HomeModule } from './home.module';

describe('DashboardModule', () => {
  let dashboardModule: HomeModule;

  beforeEach(() => {
    dashboardModule = new HomeModule();
  });

  it('should create an instance', () => {
    expect(dashboardModule).toBeTruthy();
  });
});
