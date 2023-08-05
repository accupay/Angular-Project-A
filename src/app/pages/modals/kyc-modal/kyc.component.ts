import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AdminLayoutSidebarLargeComponent } from "src/app/shared/components/layouts/admin-layout-sidebar-large/admin-layout-sidebar-large.component";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";
@Component({
  selector: "app-kyc-modal",
  templateUrl: "./kyc.component.html",
  styleUrls: ["./kyc.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class KycModalComponent implements OnInit {

  retailerRefId = "";
  retailerMobileNo = "";
  retailerName = "";
  transactionDetails: any;
  kycFlag: boolean = false;
  readable: boolean = false;
  kycTypeConfig = {
    displayKey: "name",
    value: "id",
  };
  kycTypeList = [
    {
      id: "2",
      name: "Required",
    },
    {
      id: "5",
      name: "Not Required",
    },
  ];
  kycDefaultValue = {
    id: "2",
    name: "Required",
  };

  @ViewChild(AdminLayoutSidebarLargeComponent)
  child: AdminLayoutSidebarLargeComponent;
  constructor(
    public activeModal: NgbActiveModal,
    private dmtService: DmtService,
    private EncrDecr: EncrDecrService
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  ngOnInit() {
  }


  confirm(sts: any) {
    let transId = this.transactionDetails.transaction_id;

    let status = sts === 'sub' ? this.kycDefaultValue.id : sts === 'App' ? '4' : sts === 'Rej' ? '6' : '';
    const reportParam = {
      transaction_id: transId ? transId : '',
      approval_status: status ? status : '',
      user_ref_id: this.retailerRefId,
    };
    this.dmtService.updateCustomerKYC_payout(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (sts === 'App') {
            Swal.fire({
              title: "Success!",
              text: "Kyc Approved Successful.",
              icon: "success",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
            }).then((result) => {
              if (result.isConfirmed) {
                this.activeModal.close(false);
              }
            });
          } else if (sts === 'Rej') {
            Swal.fire({
              title: "Success!",
              text: "Kyc Rejected Successful.",
              icon: "success",
              confirmButtonColor: "#1172b3",
              confirmButtonText: "Ok",
            }).then((result) => {
              if (result.isConfirmed) {
                this.activeModal.close(false);
              }
            });
          } else {
            this.activeModal.close(true);
          }

        } else {
          Swal.fire({
            title: "Error!",
            text: "An error occured. Please contact administrator for further support",
            icon: "error",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
          });
        }
      },
      (err) => {
        this.activeModal.close(false);
      }
    );
  }

  close() {
    this.activeModal.close(false);
  }

  openLink(link) {
    window.open(link);
  }
}
