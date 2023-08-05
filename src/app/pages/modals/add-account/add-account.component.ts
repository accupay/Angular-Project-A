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
import { CheckIfscComponent } from "../check-ifsc/check-ifsc.component";

interface IBeneficiaryForm {
  payee_name?: string;
  mobile_no?: string;
  ifsc_code?: string;
  account_number?: string;
  bankType?: any;
  bank_ref_id?: any;
}
@Component({
  selector: "app-add-account",
  templateUrl: "./add-account.component.html",
  styleUrls: ["./add-account.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AddAccountComponent implements OnInit {

  addAccountForm!: FormGroup;
  beneficiary: IBeneficiaryForm;
  retailerMobileNo = '';
  retailerRefId = '';
  ifscLookUpData = [];
  bankName = "";
  bankBranch = "";
  bankAddress = "";
  bankRefId = ""
  ifsc = '';
  minDigitAcc = 10;
  maxDigitAcc = 10;
  getfile: File = null;
  getfilename='';
  @ViewChild(AdminLayoutSidebarLargeComponent)
  child: AdminLayoutSidebarLargeComponent;

  constructor(
    public activeModal: NgbActiveModal,
    private dmtService: DmtService,
    private modalService: NgbModal,
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
    // this.initBeneficiary();
  }

  public initIfscForm(): void {

    this.addAccountForm = new FormGroup({
      bank: new FormControl("", [Validators.required]),
      ifsc_code: new FormControl("", [Validators.required]),
      payee_name: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9 ]*$/),
        Validators.minLength(5),
      ]),
      account_number: new FormControl("", [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ]),
      confirmAccountNumber: new FormControl("", [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
      ]),
      file: new FormControl("", [Validators.required]),
    },
      {
        validators: this.accNumShouldMatch.bind(this),
      }
    );
    this.addAccountForm.controls['ifsc_code'].disable();
    this.addAccountForm.controls['bank'].disable();
    this.addAccountForm.controls['account_number'].disable();
    this.addAccountForm.controls['confirmAccountNumber'].disable();
    this.addAccountForm.controls['payee_name'].disable();

  }

  private accNumShouldMatch(fGroup: FormGroup) {
    return fGroup.get("account_number").value ===
      fGroup.get("confirmAccountNumber").value
      ? null
      : { mismatch: true };
  }

  close() {
    this.activeModal.close(false);
  }

  notSureIfsc() {
    const modalRef = this.modalService.open(CheckIfscComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    this.beneficiary = this.addAccountForm.value;
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
        this.bankRefId = this.ifscLookUpData[0]?.bank_ref_id;
        this.ifsc = result[0]?.ifsc_code ? result[0]?.ifsc_code : '';
        this.addAccountForm.controls["ifsc_code"].setValue(
          result[0]?.ifsc_code ? result[0]?.ifsc_code : '');
        this.addAccountForm.controls["bank"].setValue(
          this.bankName ? this.bankName : '');

        this.addAccountForm.controls['account_number'].enable();
        this.addAccountForm.controls['confirmAccountNumber'].enable();
        this.addAccountForm.controls['payee_name'].enable();
        this.addAccountForm.controls[
          "payee_name"
        ].setValidators([
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9 ]*$/),
          Validators.minLength(5),
        ]);
        this.addAccountForm.controls[
          "account_number"
        ].setValidators([
          Validators.required,
          Validators.minLength(this.minDigitAcc),
          Validators.maxLength(this.maxDigitAcc),
          Validators.pattern(/^[0-9 ]*$/),
        ]);
        this.addAccountForm.controls[
          "confirmAccountNumber"
        ].setValidators([
          Validators.required,
          Validators.minLength(this.minDigitAcc),
          Validators.maxLength(this.maxDigitAcc),
          Validators.pattern(/^[0-9 ]*$/),
        ]);

      } else {
        // this.loading = false;
      }
    });
  }
  public GetFileOnLoad(event: any) {
    this.getfile = event.target.files[0];
    var element = document.getElementById("fileUpload") as HTMLInputElement | null;
    if(element != null) {
      this.getfilename = this.getfile?.name;
    }
  }
  save(data: any) {
    if (data.valid && this.bankName && this.bankName !== '' && this.ifsc && this.ifsc !== '') {
      // this.getfile=data.value.file;
      // var filename = data.value.file.replace(/^.*[\\\/]/, '')
      var filename = this.getfilename;
      const reportParam = {
        agent_mobile: this.retailerMobileNo,
        bank_account_number: data.value.confirmAccountNumber,
        account_holder_name: data.value.payee_name,
        bank_name: this.bankName,
        bank_ref_id: this.bankRefId,
        ifsc_code: this.ifsc,
        bank_file_name: filename,
        // bank_copy_file: this.getfile,
      };

      this.dmtService.addViewAccount(reportParam, this.getfile).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            Swal.fire({
              title: "Success!",
              text: res.response_message,
              icon: "success",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
              allowOutsideClick: false,
            });
            this.activeModal.close(1);
          } else {

          }
        },

      );

    }

  }
  get bank() {
    return this.addAccountForm.get("bank")!;
  }

  get ifsc_code() {
    return this.addAccountForm.get("ifsc_code")!;
  }
  get accountName() {
    return this.addAccountForm.get("accountName")!;
  }

  get accountNumber() {
    return this.addAccountForm.get("accountNumber")!;
  }
  get file() {
    return this.addAccountForm.get("file")!;
  }
}
