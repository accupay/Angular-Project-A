import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ResponseInterface } from "src/app/shared/interface";
import { CacheService } from "src/app/shared/services/cache-service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { Customer } from "../../store/customer/customer.model";
import { DmtService } from "src/app/shared/services/dmt.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-t-pin",
  templateUrl: "./t-pin.component.html",
  styleUrls: ["./t-pin.component.scss"],
})
export class TPinComponent implements OnInit {
  new_pin_value:any;
  confirm_pin_value:any;
  otp_value:any;
  checkValidTPinErrorText:boolean= false;
  checkValidOtpErrorText:boolean= false;
  otpEnable:boolean= false;
  retailerRefId:any;
  retailerMobileNo:any;
  checkTPinFormNew!: FormGroup;
  verifyFlag:boolean=false;
  verify_pin:any;
  otp_pin:any;
  pinCkeck:boolean= false;
  otpCkeck:boolean=false;
  customer_mobile:any;
 
  verificationForm!: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private cacheService: CacheService,
    private dmtService: DmtService,
  ) {}
  ngOnInit() {
   this.initLoginForm();
   this.pinCkeck=true;
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
      this.resend();
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
          //  
          const customerOtpVerfityData = {
            otp: "T-"+this.retailerMobileNo+"-"+ this.verify_pin,
            otp_state: sessionStorage.getItem("atp_c_otp_state"),
            mobile_no: this.retailerMobileNo,
            agent_ref_id: this.retailerRefId,
            is_internal: true,
            isRetailer: true,
            customer_mobile: this.customer_mobile,
          };

          this.dmtService
          .validateCustomerRegistrationOtpPayout(customerOtpVerfityData)
          .subscribe(
            (res: ResponseInterface) => {
              if (res.response_code === "200") {
                // this.loading = true;
                // this.showValidate=true;
                this.activeModal.close(true);
              } else if (res.response_code === "400") {
                // this.hideOtpErrorText = true;
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
                this.activeModal.close(false);
              }
            },
            // (err) => {
            //   this.loadingText = "verify";
            //   this.loading = false;
            // }
          );



          // 
            // let message=res.data?.description ? res.data?.description : '' ;
            // if(message === 'Pin verification Failed'){
            //   let msg= this.pinCkeck ? 'PIN verification Failed' : 'OTP verification Failed';
            //   Swal.fire({
            //     title: "Failed!",
            //     text: msg,
            //     icon: "error",
            //     confirmButtonColor: "#1172b3",
            //     confirmButtonText: "Ok",
            //     backdrop:false,
            //   });
            // }else{
            //   let msg= this.pinCkeck ? 'PIN verification Successfully' : 'OTP verification Successfully';
            //   this.activeModal.close(true);
            //   Swal.fire({
            //     title: "Success!",
            //     text: msg,
            //     icon: "success",
            //     confirmButtonColor: "#1172b3",
            //     confirmButtonText: "Ok",
            //     backdrop:false,
            //   });
            // }
           
          }
        });

    }else if(this.otpCkeck && this.otp_pin !== ''){
      // const customerOtpVerfityData = {
      //   otp: this.otp_pin,
      //   otp_state: sessionStorage.getItem("atp_c_otp_state"),
      //   mobile_no: this.retailerMobileNo,
      //   agent_ref_id: this.retailerRefId,
      //   is_internal: true,
      //   isRetailer:  true,
      //   customer_mobile: this.customer_mobile,
      // };

      // if (sessionStorage.getItem("atp_c_otp_state") === "") {
      //   this.otpStateEmpty();
      // }
      const customerOtpVerfityData = {
        otp: this.otp_pin,
        otp_state: sessionStorage.getItem("atp_c_otp_state"),
        mobile_no: this.retailerMobileNo,
        agent_ref_id: this.retailerRefId,
        is_internal: true,
        isRetailer: true,
        customer_mobile: this.customer_mobile,
      };

      this.dmtService
      .validateCustomerRegistrationOtpPayout(customerOtpVerfityData)
      .subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            // this.loading = true;
            // this.showValidate=true;
            this.activeModal.close(true);
          } else if (res.response_code === "400") {
            // this.hideOtpErrorText = true;
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
            this.activeModal.close(false);
          }
        },
        // (err) => {
        //   this.loadingText = "verify";
        //   this.loading = false;
        // }
      );
      

      
    }

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
      this.resend();
            
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

  otpStateEmpty() {
    Swal.fire({
      title: "Error!",
      text: "Something data went wrong, Please try Again!",
      icon: "error",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Ok",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  }

  close() {
    this.activeModal.close(false);
  }

  resend(){
    const otpCheckParam = {
        account_type: environment.account_type_ref_id,
        mobile_no: this.retailerMobileNo,
        agent_ref_id: this.retailerRefId,
        is_internal: true,
      };
      this.dmtService.resendOtpCRegistrationPayOut(otpCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            sessionStorage.setItem("atp_c_otp_state", res?.data?.state );
          } else {
            sessionStorage.setItem("atp_c_otp_state", "");
          }
        },
        (err) => {}
      );
  }
}
