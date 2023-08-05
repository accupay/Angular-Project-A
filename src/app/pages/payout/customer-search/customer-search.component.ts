import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { sweetalert2Config } from "src/app/providers/constant";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { CheckCustomerComponent } from "../../modals/check-customer/check-customer.component";
import { ValidateRegisterCustomerOtpComponent } from "../../modals/validate-register-customer-otp/validate-register-customer-otp.component";
import { Customer } from "../../store/customer/customer.model";
import { CustomerState } from "../../store/customer/customer.reducer";
import { TPinComponent } from "../../modals/t-pin/t-pin.component";

interface ICustomerGet {
  mobile_no?: string;
  agent_ref_id?: string;
  flag?: string;
  is_internal?: string;
}

@Component({
  selector: "app-customer-search",
  templateUrl: "./customer-search.component.html",
  styleUrls: ["./customer-search.component.scss"],
})
export class SearchCustomerComponent implements OnInit {
  loading: boolean;
  loadingText = "Proceed";
  customerSearchForm!: FormGroup;
  customer: ICustomerGet;
  confirmResut;
  retailerRefId = "";
  retailerMobileNo = "";
  isInternal: boolean;
  t_pin_check:boolean=false;
  @HostBinding("class") classes = "apt-money-transfer";
  constructor(
    private dmtService: DmtService,
    private modalService: NgbModal,
    private router: Router,
    private EncrDecr: EncrDecrService
  ) {
    this.customer = {} as ICustomerGet;
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  ngOnInit() {
    // sessionStorage.setItem("atp_c_otp_state", "");
   
    
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
    this.initCustomerForm();
    this.pinValidationCheck();
  }
  tPinCheck( type){
   
    const modalRef = this.modalService.open(TPinComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.retailerRefId = this.retailerRefId;
    modalRef.componentInstance.retailerMobileNo = this.retailerMobileNo;
    modalRef.componentInstance.customer_mobile = this.customer.mobile_no;
    modalRef.componentInstance.verifyFlag = type === "new" ? false: true;
    modalRef.result.then((result) => {
      if(result){
        if (type !== 'new') {
          // this.loading = false;
          Swal.fire({
            title: "Success!",
            text: "Customer Verified Successfully!",
            icon: "success",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              var encrypted = this.EncrDecr.set(
                environment.dataEncrptionCode,
                this.customer.mobile_no
              );
              sessionStorage.setItem("atp_c_m_n", encrypted);
              this.router.navigate(["/payout/customer-list"]);
            }
          });
        }
        // this.t_pin_check=true;
      }else{
        this.router.onSameUrlNavigation = "reload";
        this.router.navigate(["/home"]);
        // this.t_pin_check=false;
      }
    });
  }
  public initCustomerForm(): void {
    this.customerSearchForm = new FormGroup({
      mobile_no: new FormControl(this.customer.mobile_no, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
      ]),
    });
  }
  pinValidationCheck(){
    let mobNo= this.retailerMobileNo;
    const authCheckParam = {
      retailer_number: mobNo
    };
    this.dmtService.getPin_payout(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200" && res.data?.pin_Required === '1') {
          Swal.fire({
            title: "New Update!",
            text: "Please update your pin!",
            icon: "warning",
            confirmButtonColor: "#1172b3",
            cancelButtonColor: "#f9ae3b",
            confirmButtonText: "verify",
            showCancelButton: true,
            customClass: sweetalert2Config,
          }).then((result) => {
            if (result.isConfirmed) {
                this.tPinCheck("new");
            }else{
              this.router.onSameUrlNavigation = "reload";
              this.router.navigate(["/home"]);
            }
          });
        }
      });
  }
  get mobile_no() {
    return this.customerSearchForm.get("mobile_no")!;
  }

  searchCustomer() {
    if (this.customerSearchForm.invalid) {
      for (const control of Object.keys(this.customerSearchForm.controls)) {
        this.customerSearchForm.controls[control].markAsTouched();
      }
      return;
    }
    this.customer = this.customerSearchForm.value;
    const authCheckParam = {
      mobile_no: this.customer.mobile_no,
      agent_ref_id: this.retailerRefId,
      flag: "1",
      is_internal: false,
    };
    this.loading = true;
    let data1:any;
    this.dmtService.getCustomerApiPayOut(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.active_status_ref_id === "1") {
            this.loading = false;
            this.isInternal = res?.data?.is_internal;
            const customerResponseData = res?.data;
            data1=res?.data;
            Swal.fire({
              title: "Not Verified!",
              text: "Selected customer is not verified. Press OK to proceed for verification!",
              icon: "warning",
              confirmButtonColor: "#1172b3",
              cancelButtonColor: "#f9ae3b",
              confirmButtonText: "Ok",
              showCancelButton: true,
              customClass: sweetalert2Config,
            }).then((result) => {
              if (result.isConfirmed) {
                // this.resendOTPForCustomerVerification(data1);
                this.tPinCheck( "verify");
                // setTimeout(() => {
                //   this.addCustomerOtpVerifyModal(customerResponseData);
                // }, 1000);
              }
            });
          } else {
            var encrypted = this.EncrDecr.set(
              environment.dataEncrptionCode,
              this.customer.mobile_no
            );
            sessionStorage.setItem("atp_c_m_n", encrypted);
            setTimeout(() => {
              this.router.navigate(["/payout/customer-list"]);
            }, 500);
          }
        } else if (res.response_code === "201") {
          var encrypted = this.EncrDecr.set(
            environment.dataEncrptionCode,
            this.customer.mobile_no
          );
          sessionStorage.setItem("atp_c_m_n", encrypted);
          this.router.navigate(["/payout/customer-list"]);
        }
      },
      (err) => {
        this.loading = false;
        if (err.error.response_code === "101") {
          this.CustomerRegitrationconfirmModal(this.customer.mobile_no);
        }
      }
    );
  }

  resendOTPForCustomerVerification(data1) {
    const otpCheckParam = {
      account_type: environment.account_type_ref_id,
      mobile_no: this.retailerMobileNo,
      agent_ref_id: this.retailerRefId,
      is_internal: true,
    };
    this.dmtService.resendOtpCRegistrationPayOut(otpCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          // setTimeout(() => {
          //   this.addCustomerOtpVerifyModal(data1);
          // }, 1000);
          sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
        } else {
          sessionStorage.setItem("atp_c_otp_state", "");
        }
      },
      (err) => {}
    );
  }

  addCustomerOtpVerifyModal(customerResponse: any) {
     const modalRef = this.modalService.open(
      ValidateRegisterCustomerOtpComponent,
      {
        ariaLabelledBy: "modal-basic-title",
        centered: true,
        backdrop: "static",
        keyboard: false,
      }
    );
    // modalRef.componentInstance.customerOrRetailerMobileNo = this.customer?.mobile_no;
    modalRef.componentInstance.customerOrRetailerMobileNo = this.retailerMobileNo;
    modalRef.componentInstance.agentName = true;
    modalRef.componentInstance.customerIsInternal =true;
    modalRef.componentInstance.transactionType ="payout";
    modalRef.componentInstance.currentCustomerMobileNumber = this.customer.mobile_no;
    // modalRef.componentInstance.flag=0;
    modalRef.result.then((result) => {
      if (result) {
        this.loading = false;
        Swal.fire({
          title: "Success!",
          text: "Customer Verified Successfully!",
          icon: "success",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            var encrypted = this.EncrDecr.set(
              environment.dataEncrptionCode,
              this.customer.mobile_no
            );
            sessionStorage.setItem("atp_c_m_n", encrypted);
            this.router.navigate(["/payout/customer-list"]);
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  CustomerRegitrationconfirmModal(mobile_no: any) {
    const modalRef = this.modalService.open(CheckCustomerComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.customerDetail = this.customer;
    modalRef.result.then((result) => {
      if (result) {
        var encrypted = this.EncrDecr.set(
          environment.dataEncrptionCode,
          mobile_no
        );
        sessionStorage.setItem("atp_c_m_n", encrypted);
        this.router.navigate(["/payout/customer-registration"]);
      }
      if (!result) {
        this.loading = false;
      }
    });
  }

  customerRegister() {
    this.router.navigate(["/payout/customer-registration"]);
    this.modalService.dismissAll();
  }
}
