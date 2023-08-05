import {
  Component,
  HostBinding,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { map, mergeMap } from "rxjs/operators";
import { sweetalert2Config } from "src/app/providers/constant";
import { ResponseInterface } from "src/app/shared/interface";
import { CacheService } from "src/app/shared/services/cache-service";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { UtilityHelper } from "src/app/shared/utility/utilityHelpers";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { beneficiaryTransactionComponent } from "../../modals/bene-transaction/bene-transaction.component";
import { CheckIfscComponent } from "../../modals/check-ifsc/check-ifsc.component";
import { DeleteBeneOtpComponent } from "../../modals/delete-bene/delete-bene-otp.component";
import { PeriodicElement } from "../../reports/retailer-payment-transaction/retailer-payment-transaction.component";
import { Customer } from "../../store/customer/customer.model";

interface IBeneficiaryForm {
  payee_name?: string;
  mobile_no?: string;
  ifsc_code?: string;
  account_number?: string;
  bankType?: any;
  bank_ref_id?: any;
}
@Component({
  selector: "app-beneficiary-list",
  templateUrl: "./beneficiary-list.component.html",
  styleUrls: ["./beneficiary-list.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BeneficiaryListComponent implements OnInit, OnDestroy {
  customerDetails: any;
  customerName = "";
  monthlyBalance = "";
  customerBeneficiaries = [];
  customerBeneficiariesSearch = [];

  formBasic: FormGroup;
  loading: boolean;
  radioGroup: FormGroup;

  beneficiaryRegitrationForm!: FormGroup;
  beneficiary: IBeneficiaryForm;

  currentCustomerMobileNumber;

  ifscCodeFetch = "";
  ifscLookUpData = [];
  retailerRefId = "";
  retailerMobileNo = "";

  beneValidateData: any;

  beneListLoader = false;

  bankName = "";
  bankBranch = "";
  bankAddress = "";

  minDigitAcc = 10;
  maxDigitAcc = 10;

  activeId = 1;

  beneValidatedorNot = "0";
  beneValidatedNpciName = "";

  bankTypeConfig = {
    displayKey: "name",
    value: "id",
    limitTo: 2,
    placeholder: "Select Bank Type",
  };
  bankTypeList = [
    {
      id: 1,
      name: "IMPS",
    },
    {
      id: 2,
      name: "NEFT",
    },
  ];

  bankRefId = "";
  bankList = [];
  bankListConfig = {
    displayKey: "bank_name",
    value: "bank_ref_id",
    limitTo: 10,
    placeholder: "Select Bank",
    noResultsFound: "No Bank found!",
    search: true,
  };
  selectedBankType: number;
  selctedBankDetail: any;

  beneValidateFormBtnClass = "btn-warning";

  // Sender Transaction Report Variables
  reportSearch = false;
  reportSearchloadingText = "Search";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Transaction ID",
    "Customer Name",
    "Customer Mob.No",
    "Beneficiary Name",
    "Bank",
    "Acc.No",
    "Pay Mode",
    "Amount",
    "Transaction Status",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  fromDate = new Date();
  toDate = new Date();

  searchByConfig = {
    displayKey: "name",
    value: "search_option",
    placeholder: "Select option",
  };
  searchByList = [
    {
      search_option: "0",
      name: "All",
    },
    {
      search_option: "1",
      name: "Transaction ID",
    },
    {
      search_option: "2",
      name: "Customer Mobile Number",
    },
  ];
  searchByDefaultValue = {
    search_option: "0",
    name: "All",
  };
  searchValue = "";
  reportResult = [];
  searchValues: any;
  serviceIdflag:boolean=false;
  constructor(
    private dmtService: DmtService,
    private modalService: NgbModal,
    private cacheService: CacheService,
    private EncrDecr: EncrDecrService,
    private router: Router,
    private ngxService: NgxUiLoaderService
  ) {
    this.currentCustomerMobileNumber = this.EncrDecr.get(
      environment.dataEncrptionCode,
      sessionStorage.getItem("atp_c_m_n")
    );

    let serviceflag=  this.EncrDecr.get(
      environment.dataEncrptionCode,
      sessionStorage.getItem("setServiceId")
    );
    this.serviceIdflag= (serviceflag && serviceflag !== '' && serviceflag ==='true') ? true : false;
    this.beneficiary = {} as IBeneficiaryForm;

    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  @HostBinding("class") classes = "apt-customer-list";

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this.initBeneficiary();
    this.initBeneficiaryForm();
  }

  initBeneficiary() {
    this.beneListLoader = true;

    if(this.serviceIdflag){
      const authCheckParam = {
        mobile_no: this.currentCustomerMobileNumber,
        agent_ref_id: this.retailerRefId,
        flag: "0",
        is_internal: false,
        bank_id:"12"
      };
      this.dmtService
      .getCustomerFinoApi(authCheckParam)
      .pipe(
        map(
          (res: ResponseInterface) => {
            if (res.response_code === "200") {
              this.customerDetails = res.data;
              // Trigger Sender Transaction Report on Page Load
              setTimeout(() => {
                this.searchTransaction();
              }, 100);
              this.monthlyBalance = UtilityHelper.currenyFormat(
                this.customerDetails.bank_1_monthly_balance
              );
            }
          },
          (err) => {
            this.monthlyBalance = UtilityHelper.currenyFormat(0);
          }
        ),
        mergeMap((user) => {
          return this.dmtService.getBeneficiaryApi({
            customer_mobile_no: this.currentCustomerMobileNumber,
          });
        })
      )
      .subscribe({
        next: (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.beneListLoader = false;
            this.customerBeneficiaries = res.data;
            this.customerBeneficiariesSearch=res.data;
          }
        },
        complete: () => console.log("Completes with Success!"),
        error: (err) => console.log(err),
      });

    }else{
      const authCheckParam = {
        mobile_no: this.currentCustomerMobileNumber,
        agent_ref_id: this.retailerRefId,
        flag: "0",
        is_internal: false,
      };
      this.dmtService
      .getCustomerApi(authCheckParam)
      .pipe(
        map(
          (res: ResponseInterface) => {
            if (res.response_code === "200") {
              this.customerDetails = res.data;
              // Trigger Sender Transaction Report on Page Load
              setTimeout(() => {
                this.searchTransaction();
              }, 100);
              this.monthlyBalance = UtilityHelper.currenyFormat(
                this.customerDetails.bank_1_monthly_balance
              );
            }
          },
          (err) => {
            this.monthlyBalance = UtilityHelper.currenyFormat(0);
          }
        ),
        mergeMap((user) => {
          return this.dmtService.getBeneficiaryApi({
            customer_mobile_no: this.currentCustomerMobileNumber,
          });
        })
      )
      .subscribe({
        next: (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.beneListLoader = false;
            this.customerBeneficiaries = res.data;
            this.customerBeneficiariesSearch=res.data;
          }
        },
        complete: () => console.log("Completes with Success!"),
        error: (err) => console.log(err),
      });
    }
    
  }

  getCustomerData(userId: any): void {
    const authCheckParam = {
      mobile_no: this.currentCustomerMobileNumber,
      agent_ref_id: this.retailerRefId,
      flag: "0",
      is_internal: false,
    };

    this.dmtService.getCustomerApi(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.customerDetails = res.data;
          this.monthlyBalance = UtilityHelper.currenyFormat(
            this.customerDetails.bank_1_monthly_balance
          );
        }
      },
      (err) => {
        this.monthlyBalance = UtilityHelper.currenyFormat(0);
      }
    );
  }

  public initBeneficiaryForm(): void {
    this.beneficiaryRegitrationForm = new FormGroup(
      {
        payee_name: new FormControl("", [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9 ]*$/),
          Validators.minLength(5),
        ]),
        mobile_no: new FormControl("", [
          // Validators.required,
          // Validators.minLength(1),
          // Validators.maxLength(10),
        ]),
        bankType: new FormControl("", [Validators.required]),
        bank_ref_id: new FormControl("", [Validators.required]),
        ifsc_code: new FormControl("", [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
        ]),
        account_number: new FormControl("", [Validators.required, ]),
        confirmAccountNumber: new FormControl("", [Validators.required,]),
        // account_number: new FormControl("", [Validators.required,Validators.pattern("^[A-Za-z0-9]{6}[0-9]*$"), ]),
        // confirmAccountNumber: new FormControl("", [Validators.required,Validators.pattern("^[A-Za-z0-9]{6}[0-9]*$"),]),
      },
      {
        validators: this.accNumShouldMatch.bind(this),
      }
    );
  }

  private accNumShouldMatch(fGroup: FormGroup) {
    return fGroup.get("account_number").value ===
      fGroup.get("confirmAccountNumber").value
      ? null
      : { mismatch: true };
  }

  beneficiaryRegitrationSubmit() {
    if (this.beneficiaryRegitrationForm.invalid) {
      for (const control of Object.keys(
        this.beneficiaryRegitrationForm.controls
      )) {
        this.beneficiaryRegitrationForm.controls[control].markAsTouched();
      }
      return;
    }
    this.loading = true;
    this.beneficiary = this.beneficiaryRegitrationForm.value;
    const beneFormData = {
      payee_ref_id: "0",
      payee_name: this.beneficiary?.payee_name,
      payee_mobile_no: this.beneficiary?.mobile_no,
      ifsc_code: this.beneficiary?.ifsc_code,
      ifsc_bank_ref_id: this.ifscLookUpData[0]?.bank_ref_id+'',
      ifsc_bank_branch_ref_id: this.ifscLookUpData[0]?.bank_branch_ref_id,
      account_number: this.beneficiary?.account_number,
      active_status_ref_id: "",
      payee_name_npci: this.beneValidatedNpciName,
      validated: this.beneValidatedorNot,
      mobile_no: this.customerDetails.mobile_number,
      agent_ref_id: this.retailerRefId,
      bank_type_id: this.beneficiary?.bankType?.id +'',
      flag: "0",
      bank_id: "",
      bank_ref_id: this.beneficiary?.bank_ref_id.bank_ref_id+'',
    };

    this.dmtService.addPayee(beneFormData).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.beneValidatedorNot = "0";
          this.beneValidatedNpciName = "";
          this.loading = false;
          Swal.fire({
            title: "Success!",
            text: "Beneficiary added successfully!",
            icon: "success",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.routeReuseStrategy.shouldReuseRoute = function () {
                return false;
              };
              this.router.onSameUrlNavigation = "reload";
              this.router.navigate(["/money-transfer/customer-list"]);
            }
          });
        } else {
          this.loading = false;
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  beneValidate(bene: any, type = "form") {
    this.beneficiary = this.beneficiaryRegitrationForm.value;
    this.beneValidateData = bene;

    var beneValidateParam;
    // Bene validate in form
    if (type === "form") {
      if (this.beneficiaryRegitrationForm.invalid) {
        for (const control of Object.keys(
          this.beneficiaryRegitrationForm.controls
        )) {
          this.beneficiaryRegitrationForm.controls[control].markAsTouched();
        }
        return;
      }
      beneValidateParam = {
        sender_mobile_number: this.customerDetails.mobile_number,
        payee_ref_id: "0",
        amount: environment.beneficiary_validate_amount,
        payment_transaction_type_refid: "3",
        pay_mode_ref_id: "1",
        agent_mobile: this.retailerMobileNo,
        account_number_in: this.beneficiary?.account_number,
        agent_ref_id: this.retailerRefId,
        bank_name: this.bankName,
        ifsc_code: this.beneficiary?.ifsc_code,
      };
      // Bene validate in list
    } else {
      beneValidateParam = {
        sender_mobile_number: this.customerDetails.mobile_number,
        payee_ref_id: this.beneValidateData?.payee_ref_id,
        amount: environment.beneficiary_validate_amount,
        payment_transaction_type_refid: "3",
        pay_mode_ref_id: "1",
        agent_mobile: this.retailerMobileNo,
        account_number_in: this.beneValidateData?.account_number,
        agent_ref_id: this.retailerRefId,
        bank_name: this.beneValidateData?.bank_name,
        ifsc_code: this.beneValidateData?.ifsc_code,
      };
    }
    Swal.fire({
      title: "Confirm!",
      text: "Are you sure want to validate this beneficiary!",
      icon: "info",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Ok",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#f9ae3b",
      showCancelButton: true,
      customClass: sweetalert2Config,
    }).then((result) => {
      if (result.isConfirmed) {
        this.ngxService.start();
        this.dmtService.payeeValidate(beneValidateParam).subscribe(
          (res: ResponseInterface) => {
            this.ngxService.stop();
            if (res.response_code === "200") {
              this.beneValidatedorNot = "1";
              this.beneValidatedNpciName = res?.data?.beneficiaryName;
              if (type == "form") {
                this.beneficiaryRegitrationForm.controls["payee_name"].setValue(
                  this.beneValidatedNpciName
                );
                this.beneValidateFormBtnClass = "btn-success";
              }
              Swal.fire({
                title: "Success!",
                icon: "success",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
                html:
                  "Beneficiary Validated Successfully <br>" +
                  "<span style='color:#1172b3'>" +
                  this.beneValidatedNpciName +
                  "</span> ",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.getCustomerData(this.currentCustomerMobileNumber);
                  setTimeout(() => {
                    this.getAllBeneficiaryData(
                      this.currentCustomerMobileNumber
                    );
                  }, 100);
                }
              });
            } else {
              this.ngxService.stop();
              Swal.fire({
                title: "Error!",
                text: "Something went wrong!",
                icon: "error",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
              });
            }
          },
          (err) => {
            this.ngxService.stop();
            Swal.fire({
              title: "Error!",
              text: "Something went wrong!",
              icon: "error",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
            });
          }
        );
      }
    });
  }

  payforBeneficiary(beneData: any) {
    const modalRef = this.modalService.open(beneficiaryTransactionComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.beneDetail = beneData;
    modalRef.componentInstance.customerDetail = this.customerDetails;
    modalRef.componentInstance.transactionType = "money-transfer";
    modalRef.componentInstance.serviceIdflag = this.serviceIdflag;
    modalRef.result.then((result) => {
      if (result) {
        setTimeout(() => {
          this.searchTransaction();
        }, 100);
      } else {
      }
    });
  }

  deleteBeneficiary(beneData: any) {
    Swal.fire({
      title: "Confirm!",
      html:
        "Are you sure want to delete this beneficiary " +
        "<span style='color:#1172b3' class='text-15'>" +
        beneData?.payee_name +
        "</span></br>" +
        "<span style='color:#1172b3'><i class='text-20 i-ID-Card'></i> " +
        beneData?.account_number +
        "</span> ",
      icon: "info",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Yes",
      cancelButtonColor: "#f9ae3b",
      showCancelButton: true,
      customClass: sweetalert2Config,
    }).then((result) => {
      if (result.isConfirmed) {
        const modalRef = this.modalService.open(DeleteBeneOtpComponent, {
          ariaLabelledBy: "modal-basic-title",
          centered: true,
          backdrop: "static",
          keyboard: false,
        });
        modalRef.componentInstance.beneDetail = beneData;
        modalRef.componentInstance.customerDetail = this.customerDetails;
        modalRef.result.then((result) => {
          if (result) {
            this.initBeneficiary();
          } else {
          }
        });
      }
    });
  }

  getAllBeneficiaryData(userId: any) {
    const authCheckParam = {
      customer_mobile_no: this.currentCustomerMobileNumber,
    };
    this.dmtService.getBeneficiaryApi(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.customerBeneficiaries = res.data;
          this.customerBeneficiariesSearch = res.data;
        }
      },
      (err) => {}
    );
  }

  getIfscLookUpData(value: any) {
    if (value.length === 11) {
      const IfscParam = {
        IFSCCode: value,
      };
      this.cacheService.getBankIfscLookUpApi(IfscParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.ifscLookUpData = res.data;
            this.bankName = this.ifscLookUpData[0]?.bank_name;
            this.bankBranch = this.ifscLookUpData[0]?.bank_branch;
            this.bankAddress = this.ifscLookUpData[0]?.address;
            this.minDigitAcc = this.ifscLookUpData[0]?.min_digit_account_number;
            this.maxDigitAcc = this.ifscLookUpData[0]?.max_digit_account_number;
            // Dynamic account number validation for min and max length
            this.beneficiaryRegitrationForm.controls[
              "account_number"
            ].setValidators([
              Validators.required,
              Validators.minLength(this.minDigitAcc),
              Validators.maxLength(this.maxDigitAcc),
            ]);
            this.beneficiaryRegitrationForm.controls[
              "confirmAccountNumber"
            ].setValidators([
              Validators.required,
              Validators.minLength(this.minDigitAcc),
              Validators.maxLength(this.maxDigitAcc),
            ]);
          }
        },
        (err) => {}
      );
    }
  }

  showIfscCode(event: any) {
    console.log("event", event);
    this.beneficiaryRegitrationForm.controls["ifsc_code"].setValue(
      event?.value?.global_ifsc
    );

    this.minDigitAcc = event?.value?.min_digit_account_number;
    this.maxDigitAcc = event?.value?.max_digit_account_number;
    this.beneficiaryRegitrationForm.controls["account_number"].setValidators([
      Validators.required,
      Validators.minLength(event?.value?.min_digit_account_number),
      Validators.maxLength(event?.value?.max_digit_account_number),
    ]);
    this.beneficiaryRegitrationForm.controls[
      "confirmAccountNumber"
    ].setValidators([
      Validators.required,
      Validators.minLength(event?.value?.min_digit_account_number),
      Validators.maxLength(event?.value?.max_digit_account_number),
    ]);

    if (event?.value?.global_ifsc) {
      this.getIfscLookUpData(event?.value?.global_ifsc);
    }
  }

  notSureIfsc() {
    const modalRef = this.modalService.open(CheckIfscComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    this.beneficiary = this.beneficiaryRegitrationForm.value;
    modalRef.componentInstance.beneFormData = this.beneficiary;
    modalRef.componentInstance.conformationFlag = true;
    modalRef.result.then((result) => {
      if (result.length) {
        this.ifscLookUpData = result;
        this.bankName = this.ifscLookUpData[0]?.bank_name;
        this.bankBranch = this.ifscLookUpData[0]?.bank_branch;
        this.bankAddress = this.ifscLookUpData[0]?.address;
        this.minDigitAcc = this.ifscLookUpData[0]?.min_digit_account_number;
        this.maxDigitAcc = this.ifscLookUpData[0]?.max_digit_account_number;
        this.beneficiaryRegitrationForm.controls["ifsc_code"].setValue(
          result[0]?.ifsc_code ? result[0]?.ifsc_code : '' );

          let bankObj:any={};
          bankObj.min_digit_account_number= this.minDigitAcc ? this.minDigitAcc : 5;
          bankObj.max_digit_account_number= this.maxDigitAcc ? this.maxDigitAcc : 10;
          bankObj.global_ifsc='';
          bankObj.bank_ref_id= result[0]?.bank_ref_id ? result[0]?.bank_ref_id : 0;
          bankObj.bank_name= result[0]?.bank_name ? result[0]?.bank_name : '';
          this.bankList[0]=bankObj;

          let banktype:any={};
          banktype.id= result[0]?.selected_bank_type ? result[0]?.selected_bank_type :1;
          banktype.name= result[0]?.selected_bank_type ? (result[0]?.selected_bank_type === 1 ? 'IMPS' : 'NEFT') : 'IMPS';
          this.bankTypeList[0] = banktype;
          this.beneficiaryRegitrationForm.controls["bank_ref_id"].setValue(bankObj );
          this.beneficiaryRegitrationForm.controls["bankType"].setValue(banktype);
          console.log('Bankinfo=>'+JSON.stringify(bankObj));
          console.log('BankType=>'+JSON.stringify(banktype));
        this.beneficiaryRegitrationForm.controls[
          "account_number"
        ].setValidators([
          Validators.required,
          Validators.minLength(this.minDigitAcc),
          Validators.maxLength(this.maxDigitAcc),
        ]);
        this.beneficiaryRegitrationForm.controls[
          "confirmAccountNumber"
        ].setValidators([
          Validators.required,
          Validators.minLength(this.minDigitAcc),
          Validators.maxLength(this.maxDigitAcc),
        ]);
      } else {
        this.loading = false;
      }
    });
  }

  getBankList(event: any) {
    this.selectedBankType = event?.value?.id;
    const bankTypeParam = {
      bank_type: event?.value?.id,
      active_banks: 2,
    };
    this.cacheService.getBankListApi(bankTypeParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length) {
            this.bankList = res.data.map((bank) => {
              return {
                bank_name: bank?.bank_name,
                bank_ref_id: bank?.bank_ref_id,
                global_ifsc: bank?.global_ifsc,
                min_digit_account_number: bank?.min_digit_account_number,
                max_digit_account_number: bank?.max_digit_account_number,
              };
            });
          }
        }
      },
      (err) => {}
    );
  }

  formCancelRedirect() {
    this.activeId = this.activeId == 1 ? 2 : 1;
  }

  searchTransaction() {
    const fromDate = moment(this.fromDate)
      .startOf("date")
      .format("YYYY-MM-DD HH:mm:ss.SSS");
    const toDate = moment(this.toDate)
      .startOf("date")
      .format("YYYY-MM-DD HH:mm:ss.SSS");
    console.log(this.searchByDefaultValue);
    const reportParam = {
      from_date: fromDate,
      to_date: toDate,
      agent_ref_id: this.retailerRefId,
      search_option: "2",
      search_value: this.customerDetails?.mobile_number,
    };

    this.reportSearch = true;
    this.dmtService.retailerPaymentReport(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.reportSearch = false;
          this.reportResult = res?.data;
          this.dataSource.data = this.reportResult?.length
            ? this.reportResult
            : [];
        } else {
          this.reportSearch = false;
          this.dataSource.data = [];
        }
      },
      (err) => {
        this.reportSearch = false;
        this.dataSource.data = [];
      }
    );
  }

  filterList(){
    if(this.searchValues == ''){
      this.customerBeneficiaries = this.customerBeneficiariesSearch.length
      ? this.customerBeneficiariesSearch
      : [];
      return;
    }

    let filterData= this.customerBeneficiariesSearch.length > 0 ? this.customerBeneficiariesSearch : [];
    if(filterData.length>0){
      filterData = filterData.filter(res =>
        (res.payee_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.account_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.ifsc_code.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.bank_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) 
      );
      this.customerBeneficiaries= filterData.length > 0 ? filterData :[];
    }
  }
  
  get payee_name() {
    return this.beneficiaryRegitrationForm.get("payee_name")!;
  }

  get bankType() {
    return this.beneficiaryRegitrationForm.get("bankType")!;
  }

  get mobile_no() {
    return this.beneficiaryRegitrationForm.get("mobile_no")!;
  }

  get account_number() {
    return this.beneficiaryRegitrationForm.get("account_number")!;
  }

  get confirmAccountNumber() {
    return this.beneficiaryRegitrationForm.get("confirmAccountNumber")!;
  }

  get bank_ref_id() {
    return this.beneficiaryRegitrationForm.get("bank_ref_id")!;
  }

  get ifsc_code() {
    return this.beneficiaryRegitrationForm.get("ifsc_code")!;
  }

  ngOnDestroy(): any {
    sessionStorage.removeItem("setServiceId");
  }
}
