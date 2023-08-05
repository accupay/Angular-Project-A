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
import { RechargeService } from "src/app/shared/services/recharge.service";
import Swal from "sweetalert2";

export interface PeriodicElement {
  transactionid?: string;
  customername?: string;
  payeename?: string;
  payeeaccountnumer?: string;
  paymode?: string;
  amount?: string;
}

@Component({
  selector: "app-recharge-report",
  templateUrl: "./recharge-report.component.html",
  styleUrls: ["./recharge-report.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class RechargeReportComponent
  implements OnInit, AfterViewInit {
  loading = false;
  loadingText = "Search";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Status Check",
    "Transaction ID",
    "Transaction Date",
    "Recharge Type",
    "Operator Id",
    "Operator Name",
    "Customer Number",
    "Amount",
    "Commision",
    "Tax",
    "TDS %",
    "TDS Amount",
    "Status",
    "Comments",
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
  statusByConfig = {
    displayKey: "name",
    value: "search_option",
    placeholder: "Select option",
  };
  statusByList = [
    // {
    //   search_option: "0",
    //   name: "All",
    // },
    {
      search_option: "1",
      name: "Pending",
    },
    {
      search_option: "2",
      name: "Success",
    },
    {
      search_option: "3",
      name: "Failed",
    },
    {
      search_option: "5",
      name: "Reversed",
    },
    // {
    //   search_option: "5",
    //   name: "Cashout",
    // },
  ];
  statusByDefaultValue = {
    search_option: "1",
    name: "Pending",
  };
  searchValue = "";

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
  // searchValue = "";
  pendingStatusCheck:boolean=false;
  reportResult = [];
  constructor(
    private rcgService: RechargeService,
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
    this.pendingStatusCheck = this.statusByDefaultValue.search_option === '1' ? true : false;
    const fromDate = moment(this.fromDate)
      .startOf("date")
      .format("YYYY-MM-DD");
    const toDate = moment(this.toDate)
      .startOf("date")
      .format("YYYY-MM-DD");
    console.log(this.searchByDefaultValue);
    const reportParam = {
      from_date: fromDate,
      to_date: toDate,
      search_option : this.searchByDefaultValue.search_option,
      search_Value : this.searchValue,
      status : this.statusByDefaultValue.search_option,
      user_id:  this.retailerRefId,
    };

    this.loading = true;
    this.rcgService.getRechargeReport(reportParam).subscribe(
      (res: any) => {
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
        // (res.agent_ref_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.comments && res.comments.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.recharge_type && res.recharge_type.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_status && res.transaction_status.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.agent_tds_amount && res.agent_tds_amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.tds_perc && res.tds_perc.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.retailer_tax && res.retailer_tax.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.agent_commision && res.agent_commision.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        // (res.date_key.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.amount && res.amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.customer_number && res.customer_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.operator_name && res.operator_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.operator_id && res.operator_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_date && res.transaction_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_id && res.transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1)
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

  exportToExcel() {
    const heyReport = this.dataSource.filteredData.map((data: any) => {
      return {
        "Transaction ID": data.transaction_id,
        "Transaction Date": data.transaction_date,
        "Recharge Type": data.recharge_type,
        "Operator Id": data.operator_id,
        "Operator Name": data.operator_name,
        "Customer Number": data.customer_number,
        "Amount": data.amount,
        "Commision": data.agent_commision,
        "Tax": data.retailer_tax,
        "TDS %": data.tds_perc,
        "TDS Amount": data.agent_tds_amount,
        "Status": data.transaction_status,
        "Comments": data.comments,
      };
    });

    if (heyReport.length) {
      const fileName = "Recharge_report.xlsx";
      const worksheet = XLSX.utils.json_to_sheet(heyReport, {});
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
    }
  }

  statusCheck(id:any){
    const reportParam = {
      transactionid : id,
      user_id:  this.retailerRefId,
    };
    this.rcgService.statusCheck(reportParam).subscribe(
      (res: any) => {
        if (res.response_code === "200") {
          this.searchTransaction();
          Swal.fire({
            title: "Success!",
            text: res.response_message,
            icon: "success",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
            allowOutsideClick: false,
            backdrop: true,
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: res.response_message,
            icon: "error",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
            allowOutsideClick: false,
            backdrop: true,
          });
        }
      },
      (err) => {
        // this.loading = false;
        Swal.fire({
          title: "Error!",
          text: err.statusText,
          icon: "error",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
          backdrop: true,
        });
      }
    );
  }
}
