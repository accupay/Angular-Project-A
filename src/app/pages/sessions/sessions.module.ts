import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SessionsRoutingModule } from "./sessions-routing.module";
import { SigninComponent } from "./signin/signin.component";
import { OtpCheckComponent } from "./otp-check/otp-check.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SharedComponentsModule } from "src/app/shared/components/shared-components.module";
import { SharedDirectivesModule } from "src/app/shared/directives/shared-directives.module";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { NavTitleService } from "src/app/shared/services/nav-title.service";
import { UserLoopUpService } from "src/app/shared/services/user-detail.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SessionsRoutingModule,
    SharedDirectivesModule,
  ],
  declarations: [SigninComponent, OtpCheckComponent, ForgotPasswordComponent],
  providers: [NavTitleService, UserLoopUpService],
})
export class SessionsModule {}
