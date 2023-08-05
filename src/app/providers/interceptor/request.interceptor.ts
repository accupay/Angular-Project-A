import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import * as _ from "lodash";
import { Store, select } from "@ngrx/store";
import { Customer } from "src/app/pages/store/customer/customer.model";
import { selectCustomerLookUpData } from "src/app/pages/store/customer/customer.selector";
import { CustomerState } from "src/app/pages/store/customer/customer.reducer";
import { Logout } from "src/app/pages/store/customer/logout.action";
import { environment } from "src/environments/environment";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import Swal from "sweetalert2";

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  protected userTokenDetail: any = {};
  retailerLookUp$!: Observable<Customer[]>;
  retailerRefId = "";
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private store: Store<CustomerState>,
    private EncrDecr: EncrDecrService
  ) {
    // this.retailerLookUp$ = this.store.pipe(select(selectCustomerLookUpData));
  }

  getApiUrlSegment(url: string) {
    const urlWithoutQueryString = url.split("?")[0].split("#")[0];
    return _.last(urlWithoutQueryString.split("/"));
  }

  hideToasters(reqUrls) {
    const urls = [
      "CheckBalance",
      "Lookup",
      "GetCustomerInfo",
      "GetAllPayee",
      "GetPincodeDetails",
      "GetBanksList",
      "IFSCBankState",
      "IFSCBankCity",
      "IFSCBankBranch",
      "IFSCLookup",
      "GetSupportInfo",
      "GetTopupInfo",
      "BeneValidate",
      "GetRefundPaymentTransactionReport",
      "TransactionLedgerReport",
      "GetRetailerPaymentTransactionReport",
      "GetRetailerPaymentTransactionReportPayOut",
      "GetRefundPaymentTransactionReportPayout",
      "CreateOrder",
    ];
    return !urls.includes(reqUrls);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log("retailerInfo");
    const sid = localStorage.getItem("sid") ? localStorage.getItem("sid") : "";
    const macId = localStorage.getItem("machineId")
      ? localStorage.getItem("machineId")
      : "";

    let retailerInfo;
    const testData = sessionStorage.getItem(environment.retailerDatakey);
    if (testData) {
      retailerInfo = this.EncrDecr.decryptJson(testData) as Customer;
      this.retailerRefId = retailerInfo?.retailer_ref_id;
    }

    if (sid) {
      req = req.clone({
        setHeaders: {
          Authorization: this.retailerRefId ? this.retailerRefId : "",
        },
        headers: req.headers
          .set("sid", sid)
          .set("Macid", macId)
          .set("Access-Control-Allow-Origin", "*"),
      });
    }

    return next.handle(req).pipe(
      map((responsedata: any) => {
        if (responsedata instanceof HttpResponse) {
          let reqUrlLast = this.getApiUrlSegment(req.url);
          const response = responsedata.body;
          // Toaster Handler
          if (
            response &&
            response.response_message !== "" &&
            req.method !== "GET" &&
            req.url != "https://api.ipify.org?format=json" &&
            this.hideToasters(reqUrlLast)
          ) {
            // this.showNotificationSuccess("Success", response.message);
          }
          // Store session id

          if (response?.session_details) {
            localStorage.setItem("sid", response?.session_details?.sid);
          }
        }
        return responsedata;
      }),
      catchError((response) => {
        switch (response.status) {
          case 400:
            this.handleBadRequest(response.error);
            break;
          case 422:
            this.handleBadRequest(response.error);
            break;
          case 401:
            this.handleUnauthorized(response);
            break;
          case 502:
            this.handleServerError502();
            break;
          case 403:
            this.handleForbidden();
            break;
          case 404:
            this.handleNotFound(response);
            break;
          case 500:
            this.handleServerError();
            break;
          case 409:
            this.handleErrorMessages(response.error.meta);
            break;
          case 503:
            this.ServerUnavilableError();
            break;
          case 0:
            this.handleServerError502();
            break;
          default:
            break;
        }
        return throwError(response);
      })
    );
  }

  public handleServerError502() {
    this.router.navigate(["server-error"]);
  }
  public handleDoc(response) {}
  /**
   * Shows notification errors when server response status is 401
   *
   * @ param error
   */
  private handleBadRequest(responseBody: any): void {
    console.log("Invalid", responseBody);
    if (
      responseBody.response_message !==
        "Customer Not Found, Please Register Customer" &&
      responseBody.response_message !== "No Records Found"
    ) {
      this.showNotificationError("", responseBody.response_message);
    }
  }
  private ServerUnavilableError(): void {
    const message = "Service Unavailable",
      title = "500";
    this.showNotificationError("", message);
  }
  /**
   * Shows notification errors when server response status is 401 and redirects user to login page
   *
   * @ param responseBody
   */
  // private handleUnauthorized(responseBody: any): void {
  //   // console.log('unauthorize response', responseBody);
  //   // this.showNotificationError('', responseBody.error.message);
  //   const message="Session Expired, Please Login again",
  //   title="401";
  //   // this.showNotificationError("", "unauthorized");
  //   this.showNotificationError("", message);
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
  //   // localStorage.clear();
  // }
  private handleUnauthorized(responseBody: any): void {
    localStorage.removeItem("sid");
    localStorage.removeItem("session_id");
    localStorage.removeItem("token_id");
    localStorage.removeItem("logged_user_id");
    localStorage.removeItem("atp_c_m_n");
    localStorage.removeItem("atp_c_otp_state");
    // window.location.reload();
    sessionStorage.clear();
    // localStorage.clear();
      Swal.fire({
        title: "Error!",
        html:
            "<span style='color:red'>Session Expired, Please Login again!!! </span> ",
        // text: "Session Expired, Please Login again!!!",
        icon: "error",
        confirmButtonColor: "#1172b3",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop:true,
      }).then((result) => {
  
        if (result.isConfirmed) {
          this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
          };
          this.router.onSameUrlNavigation = "reload";
          // window.location.reload();
          // sessionStorage.clear();
          this.router.navigate(["/sessions"]);
        }
        });
   
  }

  /**
   * Shows notification errors when server response status is 403
   */
  private handleForbidden(): void {
    this.toastr.error("ServerError403", "Error");
    this.router.navigate(["/sessions"]);
  }

  /**
   * Shows notification errors when server response status is 404
   *
   * @ param responseBody
   */
  private handleNotFound(responseBody: any): void {
    const message = "Page Not Found",
      title = "404";

    this.showNotificationError(title, message);
  }

  /**
   * Shows notification errors when server response status is 500
   */
  private handleServerError(): void {
    const message = "Internal Server Error",
      title = "500";

    this.showNotificationError(title, message);
  }

  /**
   * Parses server response and shows notification errors with translated messages
   *
   * @ param response
   */
  private handleErrorMessages(response: any): void {
    if (!response) {
      return;
    }
    this.showNotificationError("Error", response.response_message);
  }

  /**
   * Returns relative url from the absolute path
   *
   * @ param responseBody
   * @ returns {string}
   */
  private getRelativeUrl(url: string): string {
    return url.toLowerCase().replace(/^(?:\/\/|[^\/]+)*\//, "");
  }

  /**
   * Shows error notification with given title and message
   *
   * @ param title
   * @ param message
   */
  private showNotificationError(title: string, message: string): void {
    this.toastr.error(message, title);
  }

  /**
   * Shows success notification with given title and message
   *
   * @ param title
   * @ param message
   */
  private showNotificationSuccess(title: string, message: string): void {
    if (message === "You successfully changed the notification read status") {
      return;
    }
    this.toastr.success(message, title);
  }
}
