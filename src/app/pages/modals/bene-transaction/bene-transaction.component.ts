import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { sweetalert2Config } from "src/app/providers/constant";
import { AdminLayoutSidebarLargeComponent } from "src/app/shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component";
import { ResponseInterface } from "src/app/shared/interface";
import { DataService } from "src/app/shared/services/common-trigger.service";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { UtilityHelper } from "src/app/shared/utility/utilityHelpers";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";
import { beneTransactionReceiptComponent } from "../bene-transaction-receipt/bene-transaction-receipt.component";
import { ValidateRegisterCustomerOtpComponent } from "../validate-register-customer-otp/validate-register-customer-otp.component";
import { TPinComponent } from "../t-pin/t-pin.component";
@Component({
  selector: "app-bene-transaction",
  templateUrl: "./bene-transaction.component.html",
  styleUrls: ["./bene-transaction.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class beneficiaryTransactionComponent implements OnInit {
  beneTransactionForm!: FormGroup;
  beneDetail: any;
  customerDetail: any;
  loading: boolean = false;
  loadingText = "Confirm";
  currentCustomerMobileNumber = "";

  retailerRefId = "";
  retailerMobileNo = "";
  retailerName = "";

  bankTypeConfig = {
    displayKey: "name",
    value: "id",
    limitTo: 2,
  };
  myValue = "1";
  bankTypeList = [
    {
      id: "1",
      name: "IMPS",
    },
    {
      id: "2",
      name: "NEFT",
    },
  ];
  bankRefId = "";
  selectedBankType: number;
  checkValidIfscErrorText: boolean = false;
  serviceIdflag:boolean=false;
  minAmount: boolean = false;
  transactionSuccessData = {};

  transactionFormData: any;

  transactionType = "money-transfer";

  @ViewChild(AdminLayoutSidebarLargeComponent)
  child: AdminLayoutSidebarLargeComponent;
  constructor(
    public activeModal: NgbActiveModal,
    private dmtService: DmtService,
    private dataService: DataService,
    private modalService: NgbModal,
    private ngxService: NgxUiLoaderService,
    private EncrDecr: EncrDecrService
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  ngOnInit() {
    this.initIfscForm();
  }

  public initIfscForm(): void {
    const payMode = this.beneDetail.imps_status_ref_id == "4" ? "2" : "1";
    this.beneTransactionForm = new FormGroup({
      amount: new FormControl("", [Validators.required]),
      pay_mode_ref_id: new FormControl(payMode),
    });
  }

  confirm() {
    if (this.transactionType === "money-transfer") {
      this.moneyTransferConfirm("money-transfer");
    } else {
      this.moneyTransferConfirm("payout");
    }
  }

  validateOtpForTransaction(
    beneTransactionData: any,
    transactionType = "money-transfer"
  ) {
    if (transactionType === "payout") {
      this.resendOTP();
      const modalRef = this.modalService.open(
        ValidateRegisterCustomerOtpComponent,
        {
          ariaLabelledBy: "modal-basic-title",
          centered: true,
          backdrop: "static",
          keyboard: false,
        }
      );
      modalRef.componentInstance.customerOrRetailerMobileNo =
        this.transactionType === "money-transfer"
          ? this.customerDetail?.mobile_number
          : this.retailerMobileNo;
      modalRef.componentInstance.customerIsInternal = true;
      modalRef.componentInstance.transactionType = this.transactionType;
      modalRef.result.then((result) => {
        if (result) {
          this.loading = false;
          Swal.fire({
            title: "Success!",
            text: "OTP Verified Successfully!",
            icon: "success",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              this.transactionApiCall(beneTransactionData, transactionType);
            }
          });
        } else {
          this.loading = false;
        }
      });
    } else {
      this.transactionApiCall(beneTransactionData, "money-transfer");
    }
  }

  transactionApiCall(
    beneTransactionData: any,
    transactionType = "money-transfer"
  ) {
    // debugger;
    if (transactionType === "money-transfer") {
      this.ngxService.start();

      if(this.serviceIdflag){
        this.dmtService.moneyTransferFinoTransaction(beneTransactionData).subscribe(
          (res: ResponseInterface) => {
            this.loading = false;
            if (res.response_code === "200") {
              this.ngxService.stop();
              // used to trigger wallet balance after successfull transaction
              this.dataService.checkWalletBal(true);
              this.transactionSuccessData = res.data;
              let message= res.response_message;
              this.printTransactionDetail(this.transactionSuccessData, message);
              this.activeModal.close(1);
            } else {
              this.ngxService.stop();
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
            this.ngxService.stop();
            this.loading = false;
          }
        );
      }else{
        this.dmtService.moneyTransferTransaction(beneTransactionData).subscribe(
          (res: ResponseInterface) => {
            this.loading = false;
            if (res.response_code === "200") {
              this.ngxService.stop();
              // used to trigger wallet balance after successfull transaction
              this.dataService.checkWalletBal(true);
              this.transactionSuccessData = res.data;
              let message= res.response_message;
              this.printTransactionDetail(this.transactionSuccessData, message);
              this.activeModal.close(1);
            } else {
              this.ngxService.stop();
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
            this.ngxService.stop();
            this.loading = false;
          }
        );
      }
      
    } else {
      this.ngxService.start();
      this.dmtService.payoutTransaction(beneTransactionData).subscribe(
        (res: ResponseInterface) => {
          this.loading = false;
          this.ngxService.stop();
          if (res.response_code === "200") {
            // used to trigger wallet balance after successfull transaction
            this.dataService.checkWalletBal(true);
            this.transactionSuccessData = res.data;
            let message= res.response_message;
            this.printTransactionDetail(this.transactionSuccessData, message);
            this.activeModal.close(1);
          } else {
            this.ngxService.stop();
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
          this.activeModal.close(0);
          this.ngxService.stop();
          this.loading = false;
        }
      );
    }
  }

  moneyTransferConfirm(transactionType: any) {
    if (this.beneTransactionForm.invalid) {
      for (const control of Object.keys(this.beneTransactionForm.controls)) {
        this.beneTransactionForm.controls[control].markAsTouched();
      }
      return;
    }
    this.transactionFormData = this.beneTransactionForm.value;
    if (this.transactionFormData?.amount < 100) {
      this.minAmount = true;
      return;
    } else {
      this.minAmount = false;
    }
    let beneTransactionData;
    if (transactionType === "money-transfer") {
      beneTransactionData = {
        sender_mobile_number: this.customerDetail?.mobile_number,
        payee_ref_id: this.beneDetail?.payee_ref_id,
        amount: this.transactionFormData?.amount,
        payment_transaction_type_refid: "1",
        pay_mode_ref_id: this.transactionFormData?.pay_mode_ref_id,
        agent_mobile: this.retailerMobileNo,
        account_number_in: this.beneDetail?.account_number,
        agent_ref_id: this.retailerRefId,
        bank_name: this.beneDetail?.bank_name,
        ifsc_code: this.beneDetail?.ifsc_code,
      };
    } else {
      beneTransactionData = {
        sendermobilenumber: this.customerDetail?.mobile_number,
        payeeRefID: this.beneDetail?.payee_ref_id,
        amount: this.transactionFormData?.amount,
        paymentTransactionTypeRefID: "1",
        payModeRefID: this.transactionFormData?.pay_mode_ref_id,
        agentmobile: this.retailerMobileNo,
        ifsccodein: this.beneDetail?.ifsc_code,
        channelType: "1",
        latitude: "",
        longitude: "",
        agentRemarks: "",
        remarks: "",
        accountnumerin: this.beneDetail?.account_number,
        aRefID: this.retailerRefId,
        location_acquirace: "",
        agent_ip: localStorage.getItem("current_ip"),
        macID: localStorage.getItem("machineId"),
      };
    }
    Swal.fire({
      title: "Confirm!",
      html:
        "Are you sure want to send amount to this beneficiary " +
        "<span style='color:#1172b3' class='text-15'>" +
        this.beneDetail.payee_name +
        "</span> </br></br>" +
        "<span style='color:#1172b3'><i class='text-20 i-ID-Card'></i> " +
        this.beneDetail?.account_number +'<br/>'+
        this.beneDetail?.bank_name +'<br/>'+
        this.beneDetail?.ifsc_code +'<br/>'+
        "</span> </br>" +
        UtilityHelper.currenyFormat(this.transactionFormData?.amount) +
        "</span> ",
      icon: "info",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Yes",
      cancelButtonColor: "#f9ae3b",
      showCancelButton: true,
      customClass: sweetalert2Config,
    }).then((result) => {
      if (result.isConfirmed) {
        if (transactionType !== "money-transfer") {
        this.pinConfirmation(beneTransactionData,transactionType);
        }else{
          this.validateOtpForTransaction(beneTransactionData, transactionType);
                this.loading = false;
        }
    
      } else {
        this.loading = false;
      }
    });
  }
pinConfirmation(beneTransactionData, transactionType){
  const modalRef = this.modalService.open(TPinComponent, {
    ariaLabelledBy: "modal-basic-title",
    centered: true,
    backdrop: "static",
    keyboard: false,
  });
  modalRef.componentInstance.retailerRefId = this.retailerRefId;
  modalRef.componentInstance.retailerMobileNo = this.retailerMobileNo;
  modalRef.componentInstance.verifyFlag = true;
  modalRef.componentInstance.customer_mobile = this.customerDetail?.mobile_number;
  modalRef.result.then((result) => {
    if (result) {
      this.loading = false;
      Swal.fire({
        title: "Success!",
        text: "Verified Successfully!",
        icon: "success",
        confirmButtonColor: "#1172b3",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          this.transactionApiCall(beneTransactionData, transactionType);
        }
      });
    } else {
      this.loading = false;
    }
  });
}
  printTransactionDetail(TransactionResponse: any, msg:any) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;

    const PrepareTransactionDetail = {
      transaction_id: TransactionResponse?.transaction_id,
      transaction_date: TransactionResponse?.transaction_date,
      commision: TransactionResponse?.commision,
      rrn: TransactionResponse?.rrn,
      amount: TransactionResponse?.amount,
      total_amount: TransactionResponse?.totalAmount,
      sender_name: this.customerDetail?.customer_name,
      sender_mobile_number: this.customerDetail?.mobile_number,
      beneficiary_name: this.beneDetail?.payee_name,
      beneficiary_id: this.beneDetail?.payee_ref_id,
      account_number: this.beneDetail?.account_number,
      bank_name: this.beneDetail?.bank_name,
      ifsc_code: this.beneDetail?.ifsc_code,
      payment_transaction_type_refid: "1",
      pay_mode_ref_id: this.transactionFormData?.pay_mode_ref_id,
      agent_mobile: this.retailerMobileNo,
      agent_ref_id: this.retailerRefId,
      rrn_no: TransactionResponse.bankreferencenumber ? TransactionResponse.bankreferencenumber : TransactionResponse.rrn,
      transaction_status: TransactionResponse.transactionstatus ? TransactionResponse.transactionstatus : msg,
      retailer_name:TransactionResponse.agentname ? TransactionResponse.agentname : retailerInfo?.retailer_name,
      retailer_number: TransactionResponse.amobileno,
    };
    const modalRef = this.modalService.open(beneTransactionReceiptComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.beneTransactionDetails =
      PrepareTransactionDetail;
    modalRef.result.then((result) => {
      if (result.length) {
      } else {
      }
    });
  }

  minAmountCheck(amount: any) {
    if (amount < 100) {
      this.minAmount = true;
    } else {
      this.minAmount = false;
    }
  }

  get amount() {
    return this.beneTransactionForm.get("amount")!;
  }

  get pay_mode_ref_id() {
    return this.beneTransactionForm.get("pay_mode_ref_id")!;
  }
  close() {
    this.activeModal.close([]);
  }

  getCustomAmount(value: any) {
    this.beneTransactionForm.controls["amount"].setValue(value);
  }

  resendOTP() {
    const otpMobileNo =
      this.transactionType === "money-transfer"
        ? this.customerDetail?.mobile_number
        : this.retailerMobileNo;
    const otpCheckParam = {
      account_type: environment.account_type_ref_id,
      mobile_no: otpMobileNo,
      agent_ref_id: this.retailerRefId,
      is_internal: true,
    };
    if(this.transactionType === "payout"){
      this.dmtService.resendOtpCRegistrationPayOut(otpCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            if (res.response_code === "200") {
              sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
            } else {
              sessionStorage.setItem("atp_c_otp_state", "");
            }
          }
        },
        (err) => {}
      );
    } else{
    this.dmtService.resendOtpCRegistration(otpCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.response_code === "200") {
            sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
          } else {
            sessionStorage.setItem("atp_c_otp_state", "");
          }
        }
      },
      (err) => {}
    );
    }
  }
}
