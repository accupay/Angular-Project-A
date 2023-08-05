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
import { sweetalert2Config } from "src/app/providers/constant";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { CheckCustomerComponent } from "../../modals/check-customer/check-customer.component";
import { ValidateRegisterCustomerOtpComponent } from "../../modals/validate-register-customer-otp/validate-register-customer-otp.component";
import { Customer } from "../../store/customer/customer.model";

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
  @HostBinding("class") classes = "apt-money-transfer";
  servicemaster: any = [];
  servieIdflag: boolean = false;
  constructor(
    private dmtService: DmtService,
    private modalService: NgbModal,
    private router: Router,
    private EncrDecr: EncrDecrService,
  ) {
    this.customer = {} as ICustomerGet;
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.servicemaster = retailerInfo?.service_master;
    let servicedata = this.servicemaster.filter(res => res.service_id === '12');

    if(servicedata && servicedata.length > 0 && servicedata[0] && servicedata[0].service_visibility ==='2'){
      this.servieIdflag=true;
    }else{
      this.servieIdflag=false;
    }
    // this.servieIdflag = servicedata && servicedata.length > 0 ? true : false;

    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  ngOnInit() {
    // sessionStorage.setItem("atp_c_otp_state", "");
    sessionStorage.removeItem("setServiceId");
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

  get mobile_no() {
    return this.customerSearchForm.get("mobile_no")!;
  }

  onTabChanged(){
    this.initCustomerForm();
  }
  searchCustomer(val: string) {
    if (val && val != '' && val === '12') {
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
        flag: "0",
        is_internal: false,
        bank_id:"12"
      };
      this.loading = true;
      this.dmtService.getCustomerFinoApi(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            if (res.data.active_status_ref_id === "1") {
              this.loading = false;
              this.isInternal = res?.data?.is_internal;
              const customerResponseData = res?.data;
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
                  this.resendOTPForCustomerVerification();
                  setTimeout(() => {
                    this.addCustomerOtpVerifyModal(customerResponseData, 'true');
                  }, 1000);
                }
              });
            } else {
              var encrypted = this.EncrDecr.set(
                environment.dataEncrptionCode,
                this.customer.mobile_no
              );
              var enServieIdflag = this.EncrDecr.set(
                environment.dataEncrptionCode, this.servieIdflag+''
              );
              sessionStorage.setItem("setServiceId", enServieIdflag);
              sessionStorage.setItem("atp_c_m_n", encrypted);
              setTimeout(() => {
                this.router.navigate(["/money-transfer/customer-list"]);
              }, 500);
            }
          } else if (res.response_code === "201") {
            var encrypted = this.EncrDecr.set(
              environment.dataEncrptionCode,
              this.customer.mobile_no
            );
            var enServieIdflag = this.EncrDecr.set(
              environment.dataEncrptionCode, this.servieIdflag+''
            );
            sessionStorage.setItem("setServiceId", enServieIdflag);
            sessionStorage.setItem("atp_c_m_n", encrypted);
            this.router.navigate(["/money-transfer/customer-list"]);
          }
        },
        (err) => {
          this.loading = false;
          if (err.error.response_code === "101") {
            this.CustomerRegitrationconfirmModal(this.customer.mobile_no);
          }
        }
      );
    } else {

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
        flag: "0",
        is_internal: false,
      };
      this.loading = true;
      this.dmtService.getCustomerApi(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            if (res.data.active_status_ref_id === "1") {
              this.loading = false;
              this.isInternal = res?.data?.is_internal;
              const customerResponseData = res?.data;
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
                  this.resendOTPForCustomerVerification();
                  setTimeout(() => {
                    this.addCustomerOtpVerifyModal(customerResponseData,'false');
                  }, 1000);
                }
              });
            } else {
              var encrypted = this.EncrDecr.set(
                environment.dataEncrptionCode,
                this.customer.mobile_no
              );
              var enServieIdflag = this.EncrDecr.set(
                environment.dataEncrptionCode, 'false'
              );
              sessionStorage.setItem("setServiceId", enServieIdflag);
              sessionStorage.setItem("atp_c_m_n", encrypted);
              setTimeout(() => {
                this.router.navigate(["/money-transfer/customer-list"]);
              }, 500);
            }
          } else if (res.response_code === "201") {
            var encrypted = this.EncrDecr.set(
              environment.dataEncrptionCode,
              this.customer.mobile_no
            );
            sessionStorage.setItem("atp_c_m_n", encrypted);
            var enServieIdflag = this.EncrDecr.set(
              environment.dataEncrptionCode, 'false'
            );
            sessionStorage.setItem("setServiceId", enServieIdflag);
            this.router.navigate(["/money-transfer/customer-list"]);
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


  }

  resendOTPForCustomerVerification() {
    const otpCheckParam = {
      account_type: environment.account_type_ref_id,
      mobile_no: this.customer.mobile_no,
      agent_ref_id: this.retailerRefId,
      is_internal: this.isInternal,
    };
    this.dmtService.resendOtpCRegistration(otpCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
        } else {
          sessionStorage.setItem("atp_c_otp_state", "");
        }
      },
      (err) => { }
    );
  }

  addCustomerOtpVerifyModal(customerResponse: any, serviceId) {
    const modalRef = this.modalService.open(ValidateRegisterCustomerOtpComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.customerOrRetailerMobileNo = this.customer?.mobile_no;
    modalRef.componentInstance.customerIsInternal = true;
    modalRef.componentInstance.transactionType = "money-transfer";
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
            var enServieIdflag = this.EncrDecr.set(
              environment.dataEncrptionCode, serviceId
            );
            sessionStorage.setItem("setServiceId", enServieIdflag);
            this.router.navigate(["/money-transfer/customer-list"]);
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
        this.router.navigate(["/money-transfer/customer-registration"]);
      }
      if (!result) {
        this.loading = false;
      }
    });
  }

  customerRegister() {
    this.router.navigate(["/money-transfer/customer-registration"]);
    this.modalService.dismissAll();
  }
}
