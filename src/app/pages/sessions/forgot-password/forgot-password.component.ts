import {
  Component,
  HostBinding,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { SharedAnimations } from "src/app/shared/animations/shared-animations";
import { ResponseInterface } from "src/app/shared/interface/auth.interface";
import { environment } from "src/environments/environment";
import { AuthService } from "../../../shared/services/auth.service";

interface IForgotPwd {
  mobile_no: string;
  otp: string;
  new_password: any;
  confirmPassword: any;
}

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
  animations: [SharedAnimations],
  encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordComponent implements OnInit {
  loading: boolean;
  loadingText: string;
  forgotPasswordForm!: FormGroup;
  user: IForgotPwd;
  returnLoginDate: ResponseInterface;
  loginButtonText = "Sent OTP";
  hideOtpForm = false;

  timeLeft: number = 50;
  interval;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.user = {} as IForgotPwd;
  }
  @HostBinding("class") classes = "apt-session-page";

  ngOnInit() {
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
    this.forgotPasswordForm = new FormGroup(
      {
        mobile_no: new FormControl(this.user.mobile_no, [Validators.required]),
        otp: new FormControl(this.user.otp),
        new_password: new FormControl(this.user.new_password),
        confirmPassword: new FormControl(this.user.confirmPassword),
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

  get mobile_no() {
    return this.forgotPasswordForm.get("mobile_no")!;
  }

  get otp() {
    return this.forgotPasswordForm.get("otp")!;
  }

  get new_password() {
    return this.forgotPasswordForm.get("new_password")!;
  }

  get confirmPassword() {
    return this.forgotPasswordForm.get("confirmPassword")!;
  }

  otpCheck() {
    if (this.forgotPasswordForm.invalid) {
      for (const control of Object.keys(this.forgotPasswordForm.controls)) {
        this.forgotPasswordForm.controls[control].markAsTouched();
      }
      return;
    }
    this.user = this.forgotPasswordForm.value;
    if (this.user.otp || this.user.new_password) {
      const forgotPasswordParam = {
        mobile_no: this.user.mobile_no,
        account_type: environment.account_type_ref_id,
        otp: this.user.otp,
        password: this.user.new_password,
      };
      this.auth.authForgotPW(forgotPasswordParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.loginButtonText = "LOG IN";
            this.loading = true;
            this.loadingText = "Sigining in...";
            setTimeout(() => {
              this.router.navigate(["/home"]);
            }, 2000);
          }
        },
        (err) => {}
      );
    } else {
      const authCheckParam = {
        account_type: environment.account_type_ref_id,
        mobile_no: this.user.mobile_no,
      };
      this.auth.authSendOtpForForgotPW(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.forgotPasswordForm
              .get("otp")!
              .setValidators([Validators.required]);
            this.forgotPasswordForm
              .get("new_password")!
              .setValidators([Validators.required]);

            this.forgotPasswordForm
              .get("confirmPassword")!
              .setValidators([Validators.required]);
            this.timeLeft = 50;
            this.startResendOtpTimer();
            this.hideOtpForm = true;
            this.loginButtonText = "Confirm";
          } else {
          }
        },
        (err) => {}
      );
    }
    console.info("user_id:", this.user.mobile_no);
  }

  resendOTP() {
    var x: any = document.getElementById("mobile_no");
    if (x.value == "") {
      alert("Please enter mobile no");
    } else {
      const authCheckParam = {
        account_type: environment.account_type_ref_id,
        mobile_no: this.user.mobile_no,
      };
      this.auth.authSendOtpForForgotPW(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.forgotPasswordForm
              .get("otp")!
              .setValidators([Validators.required]);
            this.forgotPasswordForm
              .get("new_password")!
              .setValidators([Validators.required]);

            this.forgotPasswordForm
              .get("confirmPassword")!
              .setValidators([Validators.required]);

            this.startResendOtpTimer();
            this.hideOtpForm = true;
            this.loginButtonText = "Confirm";
          }
        },
        (err) => {}
      );
    }
  }

  startResendOtpTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
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
