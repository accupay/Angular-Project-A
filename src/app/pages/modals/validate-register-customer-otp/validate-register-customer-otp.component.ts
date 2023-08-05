import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";

@Component({
  selector: "app-validate-register-customer-otp",
  templateUrl: "./validate-register-customer-otp.component.html",
  styleUrls: ["./validate-register-customer-otp.component.scss"],
})
export class ValidateRegisterCustomerOtpComponent implements OnInit {
  retailerRefId = "";
  customerOrRetailerMobileNo: any;
  customerIsInternal: any;
  transactionType = "money-transfer";
  loading: boolean = false;
  loadingText = "Verify";
  otpValue = "";
  hideOtpErrorText: boolean = false;
  timeLeft: number = 50;
  interval;
  currentCustomerMobileNumber = "";
  agentName: boolean = false;
  showValidate: boolean = false;
  constructor(
    public activeModal: NgbActiveModal,
    private dmtService: DmtService,
    private EncrDecr: EncrDecrService,
    private ngxService: NgxUiLoaderService,
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
  }
  ngOnInit() {
    this.startResendOtpTimer();
  }

  close() {
    this.activeModal.close();
  }
  checkValidOtp() {
    if (this.otpValue) {
      this.hideOtpErrorText = false;
    } else {
      this.hideOtpErrorText = true;
    }
  }

  confirm() {
    if (this.otpValue === "" || this.otpValue === undefined) {
      this.hideOtpErrorText = true;
    } else {
      this.loading = true;
      this.loadingText = "verifying OTP...";
      const customerOtpVerfityData = {
        otp: this.otpValue,
        otp_state: sessionStorage.getItem("atp_c_otp_state"),
        mobile_no: this.customerOrRetailerMobileNo,
        agent_ref_id: this.retailerRefId,
        is_internal: this.customerIsInternal,
        isRetailer: this.transactionType === "money-transfer" ? false : true,
        customer_mobile: this.currentCustomerMobileNumber,
      };
      if (sessionStorage.getItem("atp_c_otp_state") === "") {
        this.otpStateEmpty();
      }

      if(this.transactionType === "payout"){
        this.dmtService
        .validateCustomerRegistrationOtpPayout(customerOtpVerfityData)
        .subscribe(
          (res: ResponseInterface) => {
            if (res.response_code === "200") {
              this.loading = true;
              // this.showValidate=true;
              this.activeModal.close(1);
            } else if (res.response_code === "400") {
              this.hideOtpErrorText = true;
              // this.showValidate=true;
            } else {
              // this.showValidate=false;
              Swal.fire({
                title: "Error!",
                text: "An error occured. Please contact administrator for further support",
                icon: "error",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
                backdrop:false,
              });
              this.activeModal.close(0);
            }
          },
          (err) => {
            this.loadingText = "verify";
            this.loading = false;
          }
        );
      }else{
      this.dmtService
        .validateCustomerRegistrationOtp(customerOtpVerfityData)
        .subscribe(
          (res: ResponseInterface) => {
            if (res.response_code === "200") {
              this.loading = true;
              // this.showValidate=true;
              this.activeModal.close(1);
            } else if (res.response_code === "400") {
              this.hideOtpErrorText = true;
              // this.showValidate=true;
            } else {
              // this.showValidate=false;
              Swal.fire({
                title: "Error!",
                text: "An error occured. Please contact administrator for further support",
                icon: "error",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
                backdrop:false,
              });
              this.activeModal.close(0);
            }
          },
          (err) => {
            this.loadingText = "verify";
            this.loading = false;
          }
        );
      }
    }
  }

  resendOTP() {
    const otpCheckParam = {
      account_type: environment.account_type_ref_id,
      mobile_no: this.customerOrRetailerMobileNo,
      agent_ref_id: this.retailerRefId,
      is_internal: this.customerIsInternal ? this.customerIsInternal: false ,
      flag: (this.transactionType === "money-transfer") ? 1 : 0 ,
      // is_internal: this.customerIsInternal ? this.customerIsInternal : this.transactionType === "money-transfer" ? false : true,
    };
    if(this.transactionType === "payout"){
      this.dmtService.resendOtpCRegistrationPayOut(otpCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            if (res.response_code === "200") {
              sessionStorage.setItem("atp_c_otp_state", res?.data?.state ? res?.data?.state :'');
            } else {
              sessionStorage.setItem("atp_c_otp_state", "");
            }
            this.timeLeft = 50;
            this.startResendOtpTimer();
          }
        },
        (err) => {}
      );
    }else{
    this.dmtService.resendOtpCRegistration(otpCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.response_code === "200") {
            sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
          } else {
            sessionStorage.setItem("atp_c_otp_state", "");
          }
          this.timeLeft = 50;
          this.startResendOtpTimer();
        }
      },
      (err) => {}
    );
    }
  }

  otpStateEmpty() {
    Swal.fire({
      title: "Error!",
      text: "Something went wrong, Please try Again Later!",
      icon: "error",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
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
}
