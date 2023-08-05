import { HttpClient } from "@angular/common/http";
import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { Store } from "@ngrx/store";
import { map, mergeMap } from "rxjs/operators";
import { SharedAnimations } from "src/app/shared/animations/shared-animations";
import { ResponseInterface } from "src/app/shared/interface/auth.interface";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { AuthService } from "../../../shared/services/auth.service";
import { CustomerState } from "../../store/customer/customer.reducer";

interface IUser {
  user_id: string;
  password: any;
  showPassword: boolean;
  otp: string;
}

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
  animations: [SharedAnimations],
})
export class SigninComponent implements OnInit {
  loading: boolean;
  loadingText: string;
  signinForm!: FormGroup;
  user: IUser;
  returnLoginDate: ResponseInterface;
  loginButtonText = "Continue";
  hideOtpForm = false;
  constructor(
    private auth: AuthService,
    private router: Router,
    private store: Store<CustomerState>,
    public http: HttpClient,
    private EncrDecr: EncrDecrService
  ) {
    this.user = {} as IUser;
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
    this.signinForm = new FormGroup({
      user_id: new FormControl("", [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
      ]),
      password: new FormControl("", [Validators.required]),
      otp: new FormControl(this.user.user_id),
    });
  }

  get user_id() {
    return this.signinForm.get("user_id")!;
  }
  get password() {
    return this.signinForm.get("password")!;
  }
  get otp() {
    return this.signinForm.get("otp")!;
  }

  signin() {
    if (this.signinForm.invalid) {
      for (const control of Object.keys(this.signinForm.controls)) {
        this.signinForm.controls[control].markAsTouched();
      }
      return;
    }
    this.user = this.signinForm.value;
    let loginParam = {
      ip: localStorage.getItem("current_ip"),
      mac_id: localStorage.getItem("machineId"),
      password: this.user.password,
      user_id: this.user.user_id,
    };
    this.auth
      .doLogin(loginParam)
      .pipe(
        map((res: ResponseInterface) => {
          if (res.response_code === "200") {
            // setTimeout(() => this.auth.autoLogout(), 5 * 60000);
            this.loginButtonText = "LOG IN";
            this.loadingText = "Sigining in...";
            this.loading = true;
            localStorage.setItem("token_id", res?.data?.token_id);
            localStorage.setItem("session_id", res?.data?.session_id);
            localStorage.setItem("sid", res?.data?.sid);
            this.setSessionUserID();
            setTimeout(() => {
              this.router.navigate(["/home"]);
            }, 500);
          }
        }),
        mergeMap((user) =>
          this.auth.doLoginLookUp({
            mobile_number: this.user.user_id,
            account_type: environment.account_type_ref_id,
          })
        )
      )
      .subscribe(
        (userData: any) => {
          // Set retailer lookup response to session storage
          sessionStorage.setItem(
            environment.retailerDatakey,
            this.EncrDecr.encryptJson(userData?.data)
          );
        },
        (err) => {
          if (err?.error?.response_code === "101") {
            localStorage.setItem("token_id", err?.error?.data.token_id);
            localStorage.setItem("session_id", err?.error?.data.session_id);
            this.setSessionUserID();
            this.router.navigate(["/sessions/otp-check"]);
          }
        }
      );
  }

  setSessionUserID() {
    var encrypted = this.EncrDecr.set(
      environment.dataEncrptionCode,
      this.user.user_id
    );
    localStorage.setItem("logged_user_id", encrypted);
  }

  showPassword() {
    var x: any = document.getElementById("apt_password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
}
