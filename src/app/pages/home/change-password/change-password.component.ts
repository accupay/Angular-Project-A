import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { ResponseInterface } from "src/app/shared/interface/auth.interface";
import { environment } from "src/environments/environment";
import { AuthService } from "../../../shared/services/auth.service";
import { Customer } from "../../store/customer/customer.model";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
interface IChangePwd {
  old_password: string;
  new_password: any;
  confirmPassword: any;
}
@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
})
export class ChangePasswordComponent implements OnInit {
  loading: boolean;
  loadingText: string;
  changePasswordForm!: FormGroup;
  user: IChangePwd;
  returnLoginDate: ResponseInterface;
  loginButtonText = "Sent OTP";
  hideOtpForm = false;
  retailerRefId = "";
  retailerMobileNo = "";

  constructor(
    private auth: AuthService,
    private router: Router,
    private EncrDecr: EncrDecrService
  ) {
    this.user = {} as IChangePwd;
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  @HostBinding("class") classes = "apt-session-page";

  ngOnInit() {
    setTimeout(function () {}, 3000);
    this.router.events.subscribe((event) => {
      if (
        event instanceof RouteConfigLoadStart ||
        event instanceof ResolveStart
      ) {
        this.loadingText = "Loading Dashboard Module...";

        this.loading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.loading = false;
      }
    });
    this.initLoginForm();
  }

  public initLoginForm(): void {
    this.changePasswordForm = new FormGroup(
      {
        old_password: new FormControl(this.user.old_password, [
          Validators.required,
        ]),
        new_password: new FormControl(this.user.new_password, [
          Validators.required,
        ]),
        confirmPassword: new FormControl(this.user.confirmPassword, [
          Validators.required,
        ]),
      },
      {
        validators: this.passwordsShouldMatch.bind(this),
      }
    );
  }
  private passwordsShouldMatch(fGroup: FormGroup) {
    return fGroup.get("new_password").value ===
      fGroup.get("confirmPassword").value
      ? null
      : { mismatch: true };
  }

  get old_password() {
    return this.changePasswordForm.get("old_password")!;
  }

  get new_password() {
    return this.changePasswordForm.get("new_password")!;
  }

  get confirmPassword() {
    return this.changePasswordForm.get("confirmPassword")!;
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      for (const control of Object.keys(this.changePasswordForm.controls)) {
        this.changePasswordForm.controls[control].markAsTouched();
      }
      return;
    }
    this.user = this.changePasswordForm.value;

    const authCheckParam = {
      ref_id: this.retailerRefId,
      account_type: environment.account_type_ref_id,
      old_password: this.user.old_password,
      new_password: this.user.new_password,
    };

    this.auth.authChangePW(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          setTimeout(() => {
            this.router.navigate(["/home"]);
          }, 2000);
        }
      },
      (err) => {}
    );
  }

  showPassword() {
    var x: any = document.getElementById("new_password");
    var y: any = document.getElementById("confirmPassword");
    if (x.type === "password" || y.type === "password") {
      x.type = "text";
      y.type = "text";
    } else {
      x.type = "password";
      y.type = "password";
    }
  }
}
