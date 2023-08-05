import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { DmtService } from "src/app/shared/services/dmt.service";
import { environment } from "src/environments/environment";
import { selectCustomerLookUpData } from "../../store/customer/customer.selector";
import { Store, select } from "@ngrx/store";
import { Observable } from "rxjs";
import { Customer } from "../../store/customer/customer.model";
import { ResponseInterface } from "src/app/shared/interface";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";

@Component({
  selector: "app-refund",
  templateUrl: "./refund.component.html",
  styleUrls: ["./refund.component.scss"],
})
export class RefundComponent implements OnInit {
  retailerRefId = "";
  transactionResponseData: any;
  refundType = "money-transfer";
  loading: boolean = false;
  loadingText = "Verify";
  otpValue = "";
  hideOtpErrorText: boolean = false;
  timeLeft: number = 50;
  interval;
  currentCustomerMobileNumber = "";
  agentFlag: boolean = false;




  new_pin_value:any;
  confirm_pin_value:any;
  otp_value:any;
  checkValidTPinErrorText:boolean= false;
  checkValidOtpErrorText:boolean= false;
  otpEnable:boolean= false;
  // retailerRefId:any;
  retailerMobileNo:any;
  checkTPinFormNew!: FormGroup;
  verifyFlag:boolean=false;
  verify_pin:any;
  otp_pin:any;
  pinCkeck:boolean= false;
  otpCkeck:boolean=false;
  customer_mobile:any;
  refundVerifyFlag:boolean=false;
  verificationForm!: FormGroup;



  constructor(
    public activeModal: NgbActiveModal,
    private dmtService: DmtService,
    private EncrDecr: EncrDecrService
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
  }
  ngOnInit() {
   
    if(!this.refundVerifyFlag){
      
      this.startResendOtpTimer();
    }else{
      this.verifyFlag=true;
      this.pinCkeck=true;
      this.initLoginForm();
    }
  }


  public initLoginForm(): void {
    this.checkTPinFormNew = new FormGroup(
      {
        new_pin_value: new FormControl(this.new_pin_value, [
          Validators.required,
        ]),
        confirm_pin_value: new FormControl(this.confirm_pin_value, [
          Validators.required,
        ]),
        otp_value: new FormControl(this.otp_value, [
          Validators.required,
        ]),
      },
      {
        validators: this.passwordsShouldMatch.bind(this),
      }
    );

    this.verificationForm = new FormGroup(
      {
        verify_pin_value: new FormControl(this.verify_pin, [
          Validators.required,
        ]),
        verify_otp_value: new FormControl(this.otp_pin, [
          Validators.required,
        ]),
      },
      
    );
  }
  private passwordsShouldMatch(fGroup: FormGroup) {
    return fGroup.get("new_pin_value").value ===
      fGroup.get("confirm_pin_value").value
      ? null
      : { mismatch: true };
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
      const refundOtpVerfityData = {
        otp: this.otpValue,
        mobile_no: this.transactionResponseData?.customermobileno,
        agent_ref_id: this.retailerRefId,
        transaction_id: this.transactionResponseData?.transactionid,
        payment_type: this.refundType === "money-transfer" ? "DMT" : "PAYOUT",
        flag: (this.refundType === "money-transfer") ? 5 : 0 ,
      };

      this.dmtService.refundOtp(refundOtpVerfityData).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.loading = true;
            this.activeModal.close(1);
            Swal.fire({
              title: "Success!",
              text: "Transaction Refunded Succesfully",
              icon: "success",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
            });
          } else if (res.response_code === "400") {
            this.hideOtpErrorText = true;
          } else {
            Swal.fire({
              title: "Error!",
              text: "An error occured. Please contact administrator for further support",
              icon: "error",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
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

  resendOTP() {
    const otpCheckParam = {
      account_type: environment.account_type_ref_id,
      mobile_no:
        this.refundType === "money-transfer"
          ? this.transactionResponseData?.customermobileno
          : this.transactionResponseData?.amobileno,
      agent_ref_id: this.retailerRefId,
      is_internal: true,
      flag: (this.refundType === "money-transfer") ? 5 : 0 ,
    };
    if(this.refundType === "money-transfer"){
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

    }else{
      
    this.dmtService.resendOtpCRegistrationPayOut(otpCheckParam).subscribe(
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

  selectedType(val){
    if(val === "T-PIN"){
      this.pinCkeck=true;
      this.otpCkeck=false;
      this.otp_pin='';
      this.verificationForm.controls.verify_otp_value.setValue("");
    }else{
      this.pinCkeck=false;
      this.otpCkeck=true;
      this.verify_pin='';
      this.verificationForm.controls.verify_pin_value.setValue("");
      this.resendOTP();
    }
  }
  verifySubmit(){
    if(this.pinCkeck && this.verify_pin !== ''){
      const authCheckParam = {
        retailer_number: this.retailerMobileNo,
        pin:this.verify_pin+'',
      };
      this.dmtService.verifyPin_payout(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
           
            let message=res.data?.description ? res.data?.description : '' ;
            if(message === 'Pin verification Failed'){
              Swal.fire({
                title: "Failed!",
                text: message,
                icon: "error",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
                backdrop:false,
              });
            }else{
              this.otpValue="T-" + this.retailerMobileNo+"-" +this.verify_pin ;
              this.confirm();
              // this.activeModal.close(true);
              // Swal.fire({
              //   title: "Success!",
              //   text: "Deleted successfully",
              //   icon: "success",
              //   confirmButtonColor: "#1172b3",
              //   confirmButtonText: "Ok",
              //   backdrop:false,
              // });
            }
           
          }
        });

    }else if(this.otpCkeck && this.otp_pin !== ''){


              this.otpValue=this.otp_pin ;
              this.confirm();
              // this.activeModal.close(true);
              // Swal.fire({
              //   title: "Success!",
              //   text: "Deleted successfully",
              //   icon: "success",
              //   confirmButtonColor: "#1172b3",
              //   confirmButtonText: "Ok",
              //   backdrop:false,
              // });
     }
           

      // const customerOtpVerfityData = {
      //   otp: this.otp_pin,
      //   otp_state: sessionStorage.getItem("atp_c_otp_state"),
      //   mobile_no: this.retailerMobileNo,
      //   agent_ref_id: this.retailerRefId,
      //   is_internal: true,
      //   isRetailer:  true,
      //   customer_mobile: this.transactionResponseData?.customermobileno,
      // };

      // if (sessionStorage.getItem("atp_c_otp_state") === "") {
      //   this.otpStateEmpty();
      // }
        // this.dmtService
        // .validateCustomerRegistrationOtpPayout(customerOtpVerfityData)
        // .subscribe(
        //   (res: ResponseInterface) => {
        //     if (res.response_code === "200") {
        //       // this.loading = true;
        //       // this.showValidate=true;
        //       this.activeModal.close(true);
        //     } else if (res.response_code === "400") {
        //       // this.hideOtpErrorText = true;
        //       // this.showValidate=true;
        //     } else {
        //       // this.showValidate=false;
        //       Swal.fire({
        //         title: "Error!",
        //         text: "An error occured. Please contact administrator for further support",
        //         icon: "error",
        //         confirmButtonColor: "#1172b3",
        //         confirmButtonText: "Ok",
        //         backdrop:false,
        //       });
        //       this.activeModal.close(false);
        //     }
        //   },
        
        // );
      

      
    // }

  }
  forgotPin(){
    this.verifyFlag=false;
  }

  Submit(){
    let newpin=this.new_pin_value+'';
    let confirmpin=this.confirm_pin_value+'';
    if(this.new_pin_value === this.confirm_pin_value && newpin.length === 6 && confirmpin.length === 6){
      this.checkValidTPinErrorText=false;
      this.otpEnable=true;
      this.resendOTP();
            
    }else{
      this.checkValidTPinErrorText=true;
      this.otpEnable=false;
    }
   
  }
  updatePin(){
    const authCheckParam = {
      retailer_number: this.retailerMobileNo,
      new_pin:this.new_pin_value+'',
      otp:this.otp_value+'',
    };
    this.dmtService.updatePin_payout(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.activeModal.close(true);
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
