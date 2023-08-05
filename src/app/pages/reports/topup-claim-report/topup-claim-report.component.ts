import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { Customer } from "../../store/customer/customer.model";
import * as XLSX from "xlsx";
import { beneTransactionReceiptComponent } from "../../modals/bene-transaction-receipt/bene-transaction-receipt.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

export interface PeriodicElement {
  transactionid?: string;
  customername?: string;
  payeename?: string;
  payeeaccountnumer?: string;
  paymode?: string;
  amount?: string;
}

@Component({
  selector: "app-topup-claim-report",
  templateUrl: "./topup-claim-report.component.html",
  styleUrls: ["./topup-claim-report.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TopupClaimReportComponent
  implements OnInit, AfterViewInit {
  loading = false;
  loadingText = "Search";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Apt Transaction ID",
    "Bank Transaction ID",
    "Amount",
    "Deposit Mode",
    "Deposit Bank",
    "Deposit Date",
    "Topup Type Description",
    "Approval Date",
    "Approval Status",
    "Comments",
    "Image",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  fromDate = new Date();
  toDate = new Date();
  maxDate = new Date();
  retailerRefId = "";
  retailerMobileNo = "";
  searchValues = "";
  noRecordFlag: boolean = true;
  // searchByConfig = {
  //   displayKey: "name",
  //   value: "search_option",
  //   placeholder: "Select option",
  // };
  // searchByList = [
  //   {
  //     search_option: "0",
  //     name: "All",
  //   },
  //   {
  //     search_option: "1",
  //     name: "Pending",
  //   },
  //   {
  //     search_option: "2",
  //     name: "Success",
  //   },
  //   {
  //     search_option: "3",
  //     name: "Failed",
  //   },
  //   {
  //     search_option: "4",
  //     name: "Reversed",
  //   },
  //   {
  //     search_option: "5",
  //     name: "Cashout",
  //   },
  // ];
  // searchByDefaultValue = {
  //   search_option: "0",
  //   name: "All",
  // };
  // searchValue = "";
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
    // console.log(this.searchByDefaultValue);
    const reportParam = {
      from_date: fromDate,
      to_date: toDate,
      account_type_ref_id: '3',
      account_ref_id: this.retailerRefId,
      // search_option: this.searchByDefaultValue?.search_option,
      // search_value: this.searchValue,
    };

    this.loading = true;
    this.dmtService.getTopupClaimReport(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.loading = false;
          this.reportResult = res?.data;
          this.dataSource.data = this.reportResult?.length
            ? this.reportResult
            : [];
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

  filterList() {
    if (this.searchValues == '') {
      this.dataSource.data = this.reportResult?.length
        ? this.reportResult
        : [];
      return;
    }

    let filterData = this.reportResult.length > 0 ? this.reportResult : [];
    if (filterData.length > 0) {
      filterData = filterData.filter(res =>
        (res.apt_transaction_id && res.apt_transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.bank_transaction_id && res.bank_transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.deposited_bank && res.deposited_bank.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.topup_type_description && res.topup_type_description.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.approval_status && res.approval_status.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.comments && res.comments.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.deposit_mode && res.deposit_mode.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.amount && res.amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.deposited_date && res.deposited_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.approval_date && res.approval_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) 
      );
      this.dataSource.data = filterData.length > 0 ? filterData : [];
    }
  }

  changeClass() {
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if (disWidth <= 640) {
      this.noRecordFlag = false;
      return "container-fluid touchbar";
    } else {
      this.noRecordFlag = true;
      return "example-container";
    }
  }
  viewImage(img){
    window.open(img);
  }
  exportToExcel() {
    const heyReport = this.dataSource.filteredData.map((data: any) => {
      return {
        "Apt Transaction ID": data.apt_transaction_id,
        "Bank Transaction ID": data.bank_transaction_id,
        "Amount": data.amount,
        "Deposit Mode": data.deposit_mode,
        "Deposit Bank": data.deposited_bank,
        "Deposit Date": data.deposited_date,
        "Topup Type Description": data.topup_type_description,
        "Approval Date": data.approval_date,
        "Approval Status": data.approval_status,
        "Comments": data.comments,
        "Image": data.image,
      };
    });

    if (heyReport.length) {
      const fileName = "TopupClaim_report.xlsx";
      const worksheet = XLSX.utils.json_to_sheet(heyReport, {});
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
    }
  }
  
}
