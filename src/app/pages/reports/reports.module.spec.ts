import { ReportsModule } from './reports.module';

describe('DashboardModule', () => {
  let dashboardModule: ReportsModule;

  beforeEach(() => {
    dashboardModule = new ReportsModule();
  });

  it('should create an instance', () => {
    expect(dashboardModule).toBeTruthy();
  });
});
