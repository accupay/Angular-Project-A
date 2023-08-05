import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AdminLayoutSidebarLargeComponent } from "src/app/shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RechargeService } from "src/app/shared/services/recharge.service";
import { NgxUiLoaderService } from "ngx-ui-loader";

declare var $: any;
@Component({
  selector: "app-kyc-modal",
  templateUrl: "./billPay.component.html",
  styleUrls: ["./billPay.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BillPayComponent implements OnInit {

  noRecordFlag:boolean=false;
  retailerRefId = "";
  retailerMobileNo = "";
  retailerName = "";
  transactionDetails: any;
  fetchData:any;
  billForm!: FormGroup;
  @ViewChild(AdminLayoutSidebarLargeComponent)
  child: AdminLayoutSidebarLargeComponent;
  constructor(
    public activeModal: NgbActiveModal,
    public rechargeService: RechargeService,
    
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
    this.initbillForm();
  }

  public initbillForm(): void {
    this.billForm = new FormGroup({
      amount: new FormControl(this.fetchData.amount, [Validators.required])
    });
  }

  confirm() {
    let amountvalue='';
    if(this.fetchData.amountEdit ){
    if(this.billForm.valid){

      amountvalue=this.billForm.controls.amount.value;
    }else{
      return;
    }
   }else{
    amountvalue= this.fetchData.amount;
   }

   const billParam={
    refid: this.fetchData.billertransactionID, //"AKBPSMAHW60000020230725101632062208",
    transactionID:this.fetchData.aptTransactionID, //"ABPS0087545548527722198286932062207",
    trxnRefID: "",
    customerMobileNo: this.transactionDetails.customer_mobile, //"9344633629",
    agentMobileNo: this.transactionDetails.agentMobileNo, // "8754554852",
    agentRefID: +this.transactionDetails.agentRefID, //3,
    biller_id: this.transactionDetails.billerid, // "TALE00000MAHW6",
    textboxname1: this.transactionDetails.textboxname1, //"Water Bill ID",
    textboxname2: this.transactionDetails.textboxname2,//, "NA",
    textboxname3:this.transactionDetails.textboxname3,// "NA",
    textboxname4: this.transactionDetails.textboxname4,//"NA",
    textboxname5: this.transactionDetails.textboxname5, //"NA",
    textboxvalue1: this.transactionDetails.textboxvalue1,// "31232327",
    textboxvalue2:this.transactionDetails.textboxvalue2,// "NA",
    textboxvalue3: this.transactionDetails.textboxvalue3,// "NA",
    textboxvalue4: this.transactionDetails.textboxvalue4,//"NA",
    textboxvalue5: this.transactionDetails.textboxvalue5 ,//"NA",
    amount: amountvalue,
    currency: "365",
    splitpayamount: "0",
    quickpay: "0",
    paymentMode: "Cash",
    splitpay: "No",
    offuspay: "Yes",
    duedate: "",
    billdate: "",
    billnumber: "",
    billperiod: "",
    userRefID: +this.transactionDetails.userRefID,// 3,
    billerName: this.fetchData.billerName, //"Talegaon Dabhade Nagar Parishad",
    billerCategoryID: +this.fetchData.billerCategoryID,// 18,
    billerCategoryName: this.fetchData.billerCategory,// "Water",
    transactionStatusRefID: "",
    paymentrequest: "",
    paymentresponse: "",
    customerName: this.fetchData.customerName,// "hvngjh",
    nooftextbox: this.transactionDetails.nooftextbox, // "1",
    ifscCode:this.transactionDetails.ifscCode, // "HDFC0001947",
    postalCode: this.transactionDetails.postalCode, // "600122",
    geoCode: "",
    latitude: this.transactionDetails.latitude, //"23.90",
    longitude: this.transactionDetails.longitude, // "78.08"
    mac: this.transactionDetails.mac,
    ip: this.transactionDetails.ip
   }
   this.ngxService.start();
   this.rechargeService.billDataPay(billParam).subscribe(
    (res: any) => {
      this.ngxService.stop();
      if (res.response_code === "200") {
        // this.activeModal.close(false);
        Swal.fire({
          title: "Success!",
          text: res.transactionStatus,
          imageUrl: "./assets/images/billpayment/B-Assured.png",
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Custom image",
          html:
            "Transaction Id: <span style='color:#1172b3'>" + res.transactionID + "</span> " +
            "</br> Bill Number: <span style='color:#1172b3'>" + res.billNumber+ "</span> " +
            "</br> Amount: &#8377;<span style='color:#1172b3'>" + res.amount + "</span> " +
            "</br> Customer Name: <span style='color:#1172b3'>" + res.customerName + "</span> " +
            "</br> Bill Period: <span style='color:#1172b3'>" + res.billperiod + "</span> " +
            "</br> Bill Date: <span style='color:#1172b3'>" + res.billdate + "</span> " +
            "</br> Due Date: <span style='color:#1172b3'>" + res.duedate + "</span> " +
            "</br> Transaction Date: <span style='color:#1172b3'>" + res.transactionDate + "</span> ",
          // icon: "success",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
          backdrop: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.activeModal.close(true);
            // this.intiForm();
            // this.selecttap(this.currentTabDesc);
            // this.rechargeForm.controls['recharge_Type'].setValue(this.currentTabDesc);
            // window.location.reload();
          }
        });
        $(".swal2-modal").css('background-color', 'white');

      } else {
        // this.ngxService.stop();
        Swal.fire({
          title: "Error!",
          imageUrl: "./assets/images/billpayment/B-Assured.png",
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Custom image",
          text: res.response_message  ,
          icon: "error",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
          backdrop: true,
        });
        $(".swal2-modal").css('background-color', 'white');
        // this.billerList = [];
      }
    },
    (err) => {
      this.ngxService.stop();
      Swal.fire({
        title: "Error!",
        text: err.error.response_message ? err.error.response_message : "Invalid Data"  ,
        icon: "error",
        confirmButtonColor: "#1172b3",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
        backdrop: true,
      });
      this.activeModal.close(false);
    }
  );
   console.log(billParam)

  }

  close() {
    this.activeModal.close(false);
  }

  openLink(link) {
    window.open(link);
  }
  get amount() {
    return this.billForm.get("amount")!;
  }

  changeClass() {
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if (disWidth <= 640) {
      this.noRecordFlag = false;
      return "modal-body";
    } else {
      this.noRecordFlag = true;
      return "modal-body";
    }
  }
}
