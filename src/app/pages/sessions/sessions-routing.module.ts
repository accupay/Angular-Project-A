import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { OtpCheckComponent } from "./otp-check/otp-check.component";
import { AuthGaurd } from "src/app/shared/services/auth.gaurd";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";

const routes: Routes = [
  {
    path: "signin",
    canActivate: [AuthGaurd],
    component: SigninComponent,
  },
  {
    path: "otp-check",
    canActivate: [AuthGaurd],
    component: OtpCheckComponent,
  },
  {
    path: "forgot-password",
    canActivate: [AuthGaurd],
    component: ForgotPasswordComponent,
  },
  {
    path: "",
    component: SigninComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionsRoutingModule {}
