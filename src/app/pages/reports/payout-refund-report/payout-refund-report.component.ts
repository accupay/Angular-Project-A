import { AfterViewInit, Component, OnInit, ViewChild,ViewEncapsulation } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { sweetalert2Config } from "src/app/providers/constant";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { RefundComponent } from "../../modals/refund/refund.component";
import { Customer } from "../../store/customer/customer.model";
import * as XLSX from "xlsx";

export interface PeriodicElement {
  transaction_id?: string;
  transactionstatus?: string;
  customername?: string;
  customermobileno?: string;
  payeename?: string;
  amount?: string;
}
@Component({
  selector: "app-payout-refund-report",
  templateUrl: "./payout-refund-report.component.html",
  styleUrls: ["./payout-refund-report.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PayoutRefundReportComponent implements OnInit, AfterViewInit {
  customerSearchForm!: FormGroup;
  loading = false;
  loadingText = "Search";
  searchValue="";
  noRecordFlag: boolean=true;
  transactionData: PeriodicElement[] = [];

  displayedColumns: string[] = [
    "Transaction ID",
    "Transaction Date",
    "Transaction Status",
    "Customer Name",
    "Customer Mobile.No",
    "Beneficiary Name",
    "Amount",
    "Action",
  ];
  // dataSource = new MatTableDataSource([...ELEMENT_DATA]);
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  fromDate = new Date();
  toDate = new Date();
  maxDate = new Date();
  retailerRefId = "";
  retailerMobileNo = "";

  transactionResponseData: any;

  reportResult = [];
  constructor(
    private dmtService: DmtService,
    private modalService: NgbModal,
    private EncrDecr: EncrDecrService
  ) {
    this.maxDate.setDate(this.maxDate.getDate());
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  ngOnInit() {
    this.dataSource.sort = this.sort;
    setTimeout(() => {
      this.searchTransaction();
    }, 100);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  searchTransaction() {
    const fromDate = moment(this.fromDate)
      .startOf("date")
      .format("YYYY-MM-DD HH:mm:ss.SSS");
    const toDate = moment(this.toDate)
      .startOf("date")
      .format("YYYY-MM-DD HH:mm:ss.SSS");

    const reportParam = {
      from_date: fromDate,
      to_date: toDate,
      agent_ref_id: this.retailerRefId,
    };
    this.loading = true;
    this.dmtService.payoutRefundReport(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.loading = false;
          this.reportResult = res?.data;
          this.dataSource.data = this.reportResult?.length
            ? this.reportResult.reverse()
            : [];
          console.log("this.dataSource.data", this.dataSource.data);
        } else {
          this.loading = false;
          this.dataSource.data = [];
        }
      },
      (err) => {
        this.loading = false;
        this.dataSource.data = [];
      }
    );
  }

  filterList(){
    if(this.searchValue == ''){
      this.dataSource.data = this.reportResult?.length
      ? this.reportResult
      : [];
      return;
    }

    let filterData= this.reportResult.length > 0 ? this.reportResult : [];
    if(filterData.length>0){
      filterData = filterData.filter(res =>
        (res.transactionid.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) ||
          (res.customername.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) ||
          (res.customermobileno.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) ||
          (res.payeename.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) ||
          (res.amount.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1) ||
          (res.transactionstatus.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1)
      );
      this.dataSource.data= filterData.length > 0 ? filterData :[];
    }
  }

  changeClass(){
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if(disWidth <= 640) {
        this.noRecordFlag=false;
        return "container-fluid touchbar";      
    } else {
        this.noRecordFlag=true;
        return "example-container";
    }
  }

  refund(transactionData: any) {
    this.transactionResponseData = transactionData;
    const refundParam = {
      mobile_no: transactionData?.amobileno,
      agent_ref_id: this.retailerRefId,
      account_type: environment.account_type_ref_id,
      is_internal: true,
    };
    Swal.fire({
      title: "Confirm!",
      html:
        "Are you sure want to refund this transaction? " +
        "<span style='color:#1172b3'>#" +
        transactionData.transactionid +
        "</span> ",
      icon: "info",
      confirmButtonColor: "#1172b3",
      confirmButtonText: "Yes",
      cancelButtonColor: "#f9ae3b",
      showCancelButton: true,
      customClass: sweetalert2Config,
    }).then((result) => {
      if (result.isConfirmed) {
        // this.dmtService.resendOtpCRegistrationPayOut(refundParam).subscribe(
        //   (res: ResponseInterface) => {
        //     this.loading = false;
        //     if (res.response_code === "200") {
        //       sessionStorage.setItem("atp_c_otp_state", res?.data?.state);
              const modalRef = this.modalService.open(RefundComponent, {
                ariaLabelledBy: "modal-basic-title",
                centered: true,
                backdrop: "static",
                keyboard: false,
              });
              modalRef.componentInstance.transactionResponseData =
                this.transactionResponseData;
              modalRef.componentInstance.refundType = "payout";
              modalRef.componentInstance.agentFlag = true;
              modalRef.componentInstance.refundVerifyFlag = true;
              modalRef.componentInstance.retailerMobileNo = this.retailerMobileNo;
              this.transactionResponseData;
              modalRef.result.then((result) => {
                if (result) {
                  this.searchTransaction();
                } else {
                }
              });
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
            this.loading = false;
          }
        );
    //   } else {
    //     this.loading = false;
    //   }
    // });
  }

  exportToExcel() {
    const heyReport = this.dataSource.filteredData.map((data: any) => {
      return {
        "Transaction ID": data.transactionid,
        "Transaction Date": data.createddate,
        "Transaction Status": data.transactionstatus,
        "Customer Name": data.customername,
        "Customer Mobile.No": data.customermobileno,
        "Beneficiary Name": data.payeename,
        Amount: data.amount,
      };
    });
    if (heyReport.length) {
      const fileName = "payout_refund.xlsx";
      const worksheet = XLSX.utils.json_to_sheet(heyReport, {});
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
    }
  }
}
