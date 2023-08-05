import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { HomeDefaultComponent } from "./home/home-default.component";
import { BankInfoComponent } from "./bankInfo/bankInfo.component";
import { VerifyVPAComponent } from "./verify-vpa/verify_VPA_component";

const routes: Routes = [
  {
    path: "",
    component: HomeDefaultComponent,
    data: {
      title: "Home",
      header: "Home",
    },
  },
  {
    path: "change-password",
    component: ChangePasswordComponent,
    data: {
      title: "Change Password",
      header: "Change Password",
    },
  },
  {
    path: "bank-info",
    component: BankInfoComponent,
    data: {
      title: "Bank Details",
      header: "Bank Details",
    },
  },
  {
    path: "verifyVPA",
    component: VerifyVPAComponent,
    data: {
      title: "UPI Top Up",
      header: "UPI Top Up",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
