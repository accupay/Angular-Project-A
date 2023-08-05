import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { AuthLayoutComponent } from "./shared/components/layouts/auth-layout/auth-layout.component";
import { AuthGaurd } from "./shared/services/auth.gaurd";
import { BlankLayoutComponent } from "./shared/components/layouts/blank-layout/blank-layout.component";
import { AdminLayoutSidebarCompactComponent } from "./shared/components/layouts/admin-layout-sidebar-compact/admin-layout-sidebar-compact.component";
import { AdminLayoutSidebarLargeComponent } from "./shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component";

const adminRoutes: Routes = [
  {
    path: "home",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "money-transfer",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/money-transfer/money-transfer.module").then(
        (m) => m.MoneyTransferModule
      ),
  },
  {
    path: "payout",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/payout/payout.module").then((m) => m.PayoutModule),
  },
  {
    path: "pg-link",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/pg-link/pg-link.module").then((m) => m.PgLinkModule),
  },
  {
    path: "pg-link-1",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/pg-link-1/pg-link.module").then((m) => m.PgLinkOneModule),
  },
  {
    path: "pg-link-2",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/pg-link-2/pg-link.module").then((m) => m.PgLinkTwoModule),
  },
  {
    path: "pg-link-3",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/pg-link-3/pg-link.module").then((m) => m.PgLinkThreeModule),
  },
  {
    path: "travel",
    canActivate: [AuthGaurd],
    loadChildren: () =>
    import("./pages/travel/travel.module").then((m) => m.TravelModule),
  },
  {
    path: "cash-collection",
    canActivate: [AuthGaurd],
    loadChildren: () =>
    import("./pages/cash-collection/cash-collection.module").then((m) => m.CashCollectionModule),
  },
  {
    path: "recharge",
    canActivate: [AuthGaurd],
    loadChildren: () =>
    import("./pages/recharge/recharge.module").then((m) => m.RechargeModule),
  },
  {
    path: "bill-payment",
    canActivate: [AuthGaurd],
    loadChildren: () =>
    import("./pages/bill-payment/bill-payment.module").then((m) => m.BillPaymentModule),
  },
  {
    path: "AEPS",
    canActivate: [AuthGaurd],
    loadChildren: () =>
    import("./pages/AEPS/aeps.module").then((m) => m.AepsModule),
  },
  {
    path: "reports",
    canActivate: [AuthGaurd],
    loadChildren: () =>
      import("./pages/reports/reports.module").then((m) => m.ReportsModule),
  },
  {
    path: "**",
    redirectTo: "others/404",
  },
];

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      {
        path: "sessions",
        canActivate: [AuthGaurd],
        loadChildren: () =>
          import("./pages/sessions/sessions.module").then(
            (m) => m.SessionsModule
          ),
      },
    ],
  },
  {
    path: "",
    component: BlankLayoutComponent,
    children: [
      {
        path: "others",
        loadChildren: () =>
          import("./views/others/others.module").then((m) => m.OthersModule),
      },
    ],
  },
  {
    path: "",
    component: AdminLayoutSidebarLargeComponent,
    canActivate: [AuthGaurd],
    children: adminRoutes,
  },
  {
    path: "**",
    redirectTo: "others/404",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
