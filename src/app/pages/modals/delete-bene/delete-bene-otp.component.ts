import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";

@Component({
  selector: "app-delete-bene-otp",
  templateUrl: "./delete-bene-otp.component.html",
  styleUrls: ["./delete-bene-otp.component.scss"],
})
export class DeleteBeneOtpComponent implements OnInit {
  retailerRefId = "";
  beneDetail: any;
  customerDetail: any;
  customerResponseData: any;

  agentNumber:any;
  deleteType:any;
  deleteVerifyFlag:boolean=false;
  loading: boolean = false;
  loadingText = "Verify";
  otpValue = "";
  hideOtpErrorText: boolean = false;
  timeLeft: number = 50;
  interval;
  currentCustomerMobileNumber = "";


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
    if(!this.deleteVerifyFlag){
      this.sendOtpforDeleteBene();
      this.currentCustomerMobileNumber = this.customerDetail?.mobile_number;
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
  sendOtpforDeleteBene() {
    let otpNumber= (this.deleteType && this.deleteType ==="PAYOUT") ?
              ( this.agentNumber ? this.agentNumber : "" ) : this.customerDetail?.mobile_number;
    const otpParam = {
      mobile_no: otpNumber,
      agent_ref_id: this.retailerRefId,
      account_type: environment.account_type_ref_id,
      is_internal: false,
    };
    if(this.deleteType === "PAYOUT"){
      this.dmtService
      .deleteBeneOtpPayout(otpParam)
      .subscribe((res: ResponseInterface) => {
        if (res.response_code === "200") {
          sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
        }
      });
    } else{
    this.dmtService
      .deleteBeneOtp(otpParam)
      .subscribe((res: ResponseInterface) => {
        if (res.response_code === "200") {
          sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
        }
      });
    }
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
      const deletePayee = {
        mobile_no: this.customerDetail?.mobile_number,
        payee_ref_id: this.beneDetail?.payee_ref_id,
        otp: this.otpValue,
        otp_state: sessionStorage.getItem("atp_c_otp_state"),
        beneficiary_id: this.beneDetail?.beneficiaryId,
      };
      if (sessionStorage.getItem("atp_c_otp_state") === "") {
        this.otpStateEmpty();
      }
      if(this.deleteType === "PAYOUT"){
        this.dmtService.deleteBenePayout(deletePayee).subscribe(
          (res: ResponseInterface) => {
            if (res.response_code === "200") {
              this.loading = true;
              setTimeout(() => {
                this.activeModal.close(1);
                Swal.fire({
                  title: "Success!",
                  text: "Deleted successfully",
                  icon: "success",
                  confirmButtonColor: "#1172b3",
                  confirmButtonText: "Ok",
                  backdrop:false,
                });
              }, 500);
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
      } else{
      this.dmtService.deleteBene(deletePayee).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.loading = true;
            setTimeout(() => {
              this.activeModal.close(1);
            }, 2000);
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
      this.sendOtpforDeleteBene();
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
              this.otpValue="T-"+this.retailerMobileNo+"-"+ this.verify_pin;
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

      this.otpValue=this.otp_pin;
      this.confirm();
      // this.activeModal.close(true);

      
      
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
      this.sendOtpforDeleteBene();
            
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
