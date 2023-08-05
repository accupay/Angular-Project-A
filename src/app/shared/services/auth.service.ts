import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { baseApiUrl } from "./../../providers/api/api";
import { ResponseInterface } from "./../interface/auth.interface";

import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Logout } from "src/app/pages/store/customer/logout.action";

@Injectable({
  providedIn: "root",
})
export class AuthService extends baseApiUrl {
  //Only for demo purpose
  authenticated = true;

  constructor(http: HttpClient, private router: Router, private store: Store) {
    super(http);
  }

  private URL: string = this.getAuthBaseUrl();

  // autoLogout() {
  //   localStorage.removeItem("sid");
  //   localStorage.removeItem("session_id");
  //   localStorage.removeItem("token_id");
  //   localStorage.removeItem("logged_user_id");
  //   localStorage.removeItem("atp_c_m_n");
  //   localStorage.removeItem("atp_c_otp_state");

  //   // window.open(this.redirectUrl, '_self');
  //   // } else {
  //   this.store.dispatch(new Logout());
  //   this.router.navigate(["/sessions"]);
  // }

  doLogin(params: any): Observable<ResponseInterface> {
    params.account_type_ref_id = environment.account_type_ref_id;
    console.log("params", params);
    console.log("dkasjd")
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/Login",
      params
    );
  }

  doLoginLookUp(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/Lookup",
      params
    );
  }

  authOtpCheck(params: any): Observable<ResponseInterface> {
    params.account_type_ref_id = environment.account_type_ref_id;
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/AuthOTPCheck",
      params
    );
  }

  authSendOtpForForgotPW(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/SendOTPForForgetPWD",
      params
    );
  }

  authChangePW(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/ChangePassword",
      params
    );
  }

  authForgotPW(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/ForgotPassword",
      params
    );
  }

  checkBalanceApi(params: any): Observable<ResponseInterface> {
    params.account_type = environment.account_type_ref_id;
    params.flag = "1";
    console.log("params", params);
    return this.http.post<ResponseInterface>(
      this.URL + "/api/auth/CheckBalance",
      params
    );
  }
}
