import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal, NgbTimeStruct, NgbTimepickerConfig } from "@ng-bootstrap/ng-bootstrap";
import { ResponseInterface } from "src/app/shared/interface";
import { CacheService } from "src/app/shared/services/cache-service";
import { DmtService } from "src/app/shared/services/dmt.service";
import { DatePipe } from '@angular/common'
import { Customer } from "../../store/customer/customer.model";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-top-up-claim",
  templateUrl: "./top-up-claim.component.html",
  styleUrls: ["./top-up-claim.component.scss"],
  providers: [NgbTimepickerConfig, DatePipe], // add NgbTimepickerConfig to the component providers
})
export class TopUpClaimComponent implements OnInit {
  topUpData = [];
  claimTopupForm!: FormGroup;
  bankList = [];
  bankListConfig = {
    displayKey: "bank_name",
    value: "bank_ref_id",
    limitTo: 10,
    placeholder: "Select Bank",
    noResultsFound: "No Bank found!",
    search: true,
  };

  depositedModeList = [];
  depositedModeListConfig = {
    displayKey: "topup_type",
    value: "topup_type_refid",
    limitTo: 10,
    placeholder: "Select Bank",
    noResultsFound: "No Bank found!",
    search: true,
  };
  accountNumber = '';
  accountNumberflag: boolean = false;
  transactionId = '';
  deposited_date = new Date();
  maxDate = new Date();
  getfile: File;
  getfilename = '';
  amount1 = '';
  // time: NgbTimeStruct = { hour: 13, minute: 30, second: 30 };
  time = (new Date().getHours()) + ':' + (new Date().getMinutes());
  // seconds = true;
  retailerLookUp: any;
  constructor(
    public activeModal: NgbActiveModal,
    public cacheService: CacheService,
    config: NgbTimepickerConfig,
    private dmtService: DmtService,
    public datepipe: DatePipe,
    private EncrDecr: EncrDecrService,
    private toastr: ToastrService,
  ) {
    this.maxDate.setDate(this.maxDate.getDate());

    // customize default values of ratings used by this component tree
    config.seconds = true;
    config.spinners = false;
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerLookUp = retailerInfo;
  }
  ngOnInit() {

    this.initClaimTopupForm();
    this.getBankAndTypeList();
  }

  public initClaimTopupForm(): void {
    this.claimTopupForm = new FormGroup(
      {
        bank_ref_id: new FormControl("", [Validators.required,]),
        account_number: new FormControl("", [Validators.required,]),
        topup_type_refid: new FormControl("", [Validators.required]),
        transaction_id: new FormControl("", [Validators.required]),
        amount: new FormControl("", [Validators.required,]),
        depositedDate: new FormControl("", [Validators.required,]),
        notes: new FormControl("", []),
        file: new FormControl("", [Validators.required,]),
        timeval: new FormControl("", []),
      },

    );
  }

  onChangeHour(timeVal: any) {
    console.log(timeVal);
  }
  getBankAndTypeList() {
    
    this.cacheService.getDepositBankList().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length) {
            this.bankList = res.data;
          }
        } else {
          this.bankList = [];
        }
      },
      (err) => {
        this.bankList = [];
      }
    );

    this.cacheService.getTopupTypeList().subscribe(
      (resp: ResponseInterface) => {
        if (resp.response_code === "200") {
          if (resp.data.length) {
            this.depositedModeList = resp.data;
          }
        } else {
          this.depositedModeList = [];
        }
      },
      (err) => {
        this.depositedModeList = [];
      }
    );
  }
  selectBank(data: any) {
    
    if (data) {
      this.accountNumber = '';
      for (let i = 0; i < this.topUpData.length; i++) {
        if (data && (this.topUpData[i].bank_name.toLowerCase().indexOf(data.toLowerCase()) > -1)
          || (data.toLowerCase().indexOf(this.topUpData[i].bank_name.toLowerCase()) > -1)
        ) {
          this.accountNumber = this.topUpData[i].account_number;
          break;
        }
      }
      if (this.accountNumber && this.accountNumber !== '') {
        this.accountNumberflag = false;
      } else {
        this.accountNumberflag = true;
      }
    } else {
      this.accountNumberflag = false;
      this.accountNumber = '';
    }

  }

  close() {
    this.activeModal.close([]);
  }
  GetFileOnLoad(event: any) {
    this.getfile = event.target.files[0];
    var element = document.getElementById("fileUpload") as HTMLInputElement | null;
    if (element != null) {
      this.getfilename = this.getfile?.name;
    }
  }
  claim(data: any) {
    
    if (data.valid && this.accountNumber !== '') {
      let getDate = new Date(data.value.depositedDate + '');
      let latest_date = this.datepipe.transform(getDate, 'MM-dd-yyyy');
      let finalDate = latest_date + ' ' + this.time + ':00';
      const TopUpParam = {
        account_ref_id: this.retailerLookUp?.retailer_ref_id,
        account_type_ref_id: "3",
        mobile_number: this.retailerLookUp?.mobile_number,
        bank_transaction_id: data.value.transaction_id,
        amount: data.value.amount,
        deposited_date: finalDate,
        topup_type_refid: data.value.topup_type_refid.topup_type_refid,
        deposited_bank: data.value.bank_ref_id.bank_name,
        comments: data.value.notes,
      };
      this.dmtService.depositSlipUpload(TopUpParam, this.getfile).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            Swal.fire({
              title: "Success!",
              text: res.response_message,
              icon: "success",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
              allowOutsideClick: false,
              backdrop: true,
            }).then((result) => {
              // if (result.isConfirmed) {
              // window.location.reload();
              this.activeModal.close([]);
              // }
            });
          // }else {

          //   this.toastr.error("", res.response_message);
          //   // this.bankList = [];
          }
        },
        (err) => {
          // this.bankList = [];
        }
      );
    }
  }

  get amount() {
    return this.claimTopupForm.get("amount")!;
  }

  get topup_type_refid() {
    return this.claimTopupForm.get("topup_type_refid")!;
  }

  get transaction_id() {
    return this.claimTopupForm.get("transaction_id")!;
  }

  get account_number() {
    return this.claimTopupForm.get("account_number")!;
  }

  get bank_ref_id() {
    return this.claimTopupForm.get("bank_ref_id")!;
  }

  get depositedDate() {
    return this.claimTopupForm.get("depositedDate")!;
  }

  get notes() {
    return this.claimTopupForm.get("notes")!;
  }

  get timeval() {
    return this.claimTopupForm.get("timeval")!;
  }
  get file() {
    return this.claimTopupForm.get("file")!;
  }
}
