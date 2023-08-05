import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ResponseInterface } from "src/app/shared/interface";
import { CacheService } from "src/app/shared/services/cache-service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { Customer } from "../../store/customer/customer.model";

@Component({
  selector: "app-check-ifsc",
  templateUrl: "./check-ifsc.component.html",
  styleUrls: ["./check-ifsc.component.scss"],
})
export class CheckIfscComponent implements OnInit {
  checkIfscForm!: FormGroup;
  checkIfscFormNew!: FormGroup;
  loading: boolean = false;
  loadingText = "Confirm";
  checkFlag:boolean=false;
  conformationFlag:boolean=false;
  conIfscCode:any;

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

  bankStateList = [];
  bankStateListConfig = {
    displayKey: "state",
    value: "state_ref_id",
    limitTo: 10,
    placeholder: "Select state",
    noResultsFound: "No State found!",
    search: true,
  };

  bankCityList = [];
  bankCityListConfig = {
    displayKey: "city",
    value: "cityRefID",
    limitTo: 10,
    placeholder: "Select city",
    noResultsFound: "No City found!",
    search: true,
  };

  bankBranchList = [];
  bankBranchListConfig = {
    displayKey: "branch_name",
    value: "ifsc_code",
    limitTo: 10,
    placeholder: "Select branch",
    noResultsFound: "No Branch found!",
    search: true,
  };

  ifscDetails = [];
  selectedBankType: number;
  checkValidIfscErrorText: boolean = false;
  checkValidIfscCodeErrorText: boolean = false;
  // from bene form not sure ifsc
  beneFormData: any;
  validateflag:boolean=false;
  constructor(
    public activeModal: NgbActiveModal,
    private cacheService: CacheService
  ) {}
  ngOnInit() {
    this.validateflag= false;
    const selectedBankType = this.beneFormData?.bankType
      ? this.beneFormData?.bankType?.id
      : "";
    if (selectedBankType) {
      this.getBankList(selectedBankType);
    }
    const selectedBank = this.beneFormData?.bank_ref_id
      ? this.beneFormData?.bank_ref_id?.bank_ref_id
      : "";
    if (selectedBank) {
      this.getBankState(selectedBank);
    }
    this.initIfscForm();
  }

  public initIfscForm(): void {
    const selectedBankType = this.beneFormData?.bankType
      ? this.beneFormData?.bankType
      : "";
    const selectedBank = this.beneFormData?.bank_ref_id
      ? this.beneFormData?.bank_ref_id
      : "";
    this.checkIfscForm = new FormGroup({
      bankType: new FormControl(selectedBankType, [Validators.required]),
      bank_ref_id: new FormControl(selectedBank, [Validators.required]),
      state_ref_id: new FormControl("", [Validators.required]),
      cityRefID: new FormControl("", [Validators.required]),
      ifsc_code: new FormControl("", [Validators.required]),
    });
    this.checkIfscFormNew = new FormGroup({
      ifsc_code_value: new FormControl("", [Validators.required]),
    });
    
  }

  close() {
    this.activeModal.close([]);
  }

  confirm() {
    if (this.ifscDetails.length) {
      this.validateflag=false;
      this.ifscDetails[0].selected_bank_type = this.selectedBankType ? this.selectedBankType : 1;
      this.activeModal.close(this.ifscDetails);
    } else {
      this.validateflag=true;
      this.checkValidIfscErrorText = true;
    }
  }

  getBankList(bankId: any) {
    this.selectedBankType = bankId;
    const bankTypeParam = {
      bank_type: bankId,
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
              };
            });
          }
        }
      },
      (err) => {}
    );
  }

  getBankState(benkRefId: any) {
    this.bankRefId = benkRefId;
    const bankStateParam = {
      BankRefID: benkRefId,
    };
    this.cacheService.getBankStateListApi(bankStateParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length) {
            this.bankStateList = res.data.map((state) => {
              return {
                state: state?.state,
                state_ref_id: state?.state_ref_id,
              };
            });
          }
        }
      },
      (err) => {}
    );
  }

  getBankCity(event: any) {
    const bankCityParam = {
      BankRefID: this.bankRefId,
      StateRefID: event?.value?.state_ref_id,
    };
    this.cacheService.getBankCityListApi(bankCityParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length) {
            this.bankCityList = res.data.map((city) => {
              return {
                city: city?.city,
                cityRefID: city?.cityRefID,
              };
            });
          }
        }
      },
      (err) => {}
    );
  }

  getBankBranch(event: any) {
    const bankBranchParam = {
      BankRefID: this.bankRefId,
      cityRefID: event?.value?.cityRefID,
    };
    this.cacheService.getBankBranchListApi(bankBranchParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length) {
            this.bankBranchList = res.data.map((branch) => {
              return {
                ifsc_code: branch?.ifsc_code,
                branch_name: branch?.branch_name,
              };
            });
          }
        }
      },
      (err) => {}
    );
  }

  getBankIfscLookUp(event: any) {
    const bankBranchParam = {
      IFSCCode: event?.value?.ifsc_code,
    };
    this.cacheService.getBankIfscLookUpApi(bankBranchParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.validateflag=true;
          if (res.data.length) {
            this.checkValidIfscErrorText = false;
            this.ifscDetails = res.data;
          } else {
            this.validateflag=false;
            this.checkValidIfscErrorText = true;
          }
        }
      },
      (err) => {}
    );
  }

  getIfscVerification() {
    const bankBranchParam = {
      IFSCCode: this.conIfscCode,
    };
    this.cacheService.getBankIfscLookUpApi(bankBranchParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.validateflag=true;
          if (res.data.length) {
            this.checkValidIfscCodeErrorText = false;
            this.ifscDetails = res.data;
          } else {
            this.validateflag=false;
            this.checkValidIfscCodeErrorText = true;
          }
        }
      },
      (err) => {}
    );
  }

  ClickYes(){
    this.checkValidIfscCodeErrorText = false;
    this.checkFlag=true;
  }
  ClickOk(){
    if (this.ifscDetails.length) {
      this.ifscDetails[0].selected_bank_type = this.selectedBankType ? this.selectedBankType : 1;
      this.checkValidIfscCodeErrorText = false;
      this.activeModal.close(this.ifscDetails);
    } else {
      this.checkValidIfscCodeErrorText = true;
    }
    // this.checkFlag=false;
    // this.activeModal.close(this.ifscDetails);
  }

  ClickNo(){
    this.checkFlag=false;
    this.conIfscCode="";
    this.conformationFlag=false;
    this.checkValidIfscCodeErrorText = false;
  }
  back(){
    this.checkFlag=false;
    this.conformationFlag=true;
    this.initIfscForm();
  }
}
