import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import MD5 from "crypto-js/md5";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./shared/services/auth.service";
import { EncrDecrService } from "./shared/services/encr-decr.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  deviceInfo = null;
  subscription: Subscription;
  constructor(
    public router: Router,
    private auth: AuthService,
    private EncrDecr: EncrDecrService,
    private http: HttpClient
  ) {
    var min = 10000;
    var max = 999999;
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    const machineId = localStorage.getItem("machineId");
    if (!machineId || machineId === undefined || machineId === "") {
      localStorage.setItem("machineId", MD5(num + "-APT").toString());
    }
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!router.navigated) {
          var encrypMobileNo = this.EncrDecr.get(
            environment.dataEncrptionCode,
            localStorage.getItem("logged_user_id") || ""
          );
          console.log("encrypMobileNo", encrypMobileNo);
          if (encrypMobileNo) {
            this.auth
              .doLoginLookUp({
                mobile_number: encrypMobileNo,
                account_type: environment.account_type_ref_id,
              })
              .subscribe(
                (userData) => {
                  // Set retailer lookup response to session storage
                  sessionStorage.setItem(
                    environment.retailerDatakey,
                    this.EncrDecr.encryptJson(userData?.data)
                  );
                },
                (err) => {}
              );
          }
        }
      }
    });
  }

  ngOnInit() {
    if (!sessionStorage.getItem(environment.retailerDatakey)) {
      localStorage.removeItem("sid");
      localStorage.removeItem("session_id");
      localStorage.removeItem("token_id");
      localStorage.removeItem("logged_user_id");
      localStorage.removeItem("atp_c_m_n");
      localStorage.removeItem("atp_c_otp_state");
      sessionStorage.removeItem(environment.retailerDatakey);
      this.router.navigate(["/sessions"]);
    }

    if (!localStorage.getItem("current_ip")) {
      this.http.get("https://api.ipify.org?format=json").subscribe(
        (res: any) => {
          localStorage.setItem("current_ip", res.ip);
        },
        (err) => {
          localStorage.setItem("current_ip", "");
        }
      );
    }
  }
}
