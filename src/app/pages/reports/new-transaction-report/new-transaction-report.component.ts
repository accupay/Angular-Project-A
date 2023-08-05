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
  selector: "app-new-transaction-report",
  templateUrl: "./new-transaction-report.component.html",
  styleUrls: ["./new-transaction-report.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class NewTransactionReportComponent
  implements OnInit, AfterViewInit {
  loading = false;
  loadingText = "Search";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Transaction ID",
    // "Data Key",
    // "Agent Ref Id",
    "Transaction Date",
    "Customer Name",
    "Customer Number",
    "Payment Mode",
    "Transaction Type",
    "Transaction Mode",
    "Status",
    "Opening Balance",
    "Transaction Amount",
    "Fees",
    "Settlement Amount",
    "Closing Balance",
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
      search_option: "4",
      name: "Reversed",
    },
    {
      search_option: "5",
      name: "Cashout",
    },
  ];
  searchByDefaultValue = {
    search_option: "0",
    name: "All",
  };
  searchValue = "";
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
    console.log(this.searchByDefaultValue);
    const reportParam = {
      from_date: fromDate,
      to_date: toDate,
      status: this.searchByDefaultValue.search_option,
      agent_ref_id: this.retailerRefId,
      // search_option: this.searchByDefaultValue?.search_option,
      // search_value: this.searchValue,
    };

    this.loading = true;
    this.dmtService.getTransactionReport(reportParam).subscribe(
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
        // (res.agent_ref_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.customer_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.customer_mobile.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_type.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.payment_mode.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.fees.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        // (res.date_key.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.settlement_amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.opening_balance.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_mode.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.closing_balance && res.closing_balance.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_status && res.transaction_status.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.created_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1)
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
        // "Data Key": data.date_key,
        // "Agent Ref Id": data.agent_ref_id,
        "Transaction Date": data.created_date,
        "Customer Name": data.customer_name,
        "Customer Number": data.customer_mobile,
        "Payment Mode": data.payment_mode,
        "Transaction Type": data.transaction_type,
        "Transaction Mode": data.transaction_mode,
        "Status": data.transaction_status ?  data.transaction_status : '-',
        "Opening Balance": data.opening_balance,
        "Transaction Amount": data.transaction_amount,
        "Fees": data.fees,
        "Settlement Amount": data.settlement_amount,
        "Closing Balance": data.closing_balance ?  data.closing_balance : '-',
      };
    });

    if (heyReport.length) {
      const fileName = "transaction_report.xlsx";
      const worksheet = XLSX.utils.json_to_sheet(heyReport, {});
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
    }
  }
  // printTransactionDetail(TransactionResponse: any) {
  //   const PrepareTransactionDetail = {
  //     transaction_id: TransactionResponse?.transactionid,
  //     transaction_date: TransactionResponse?.createddate,
  //     commision: TransactionResponse?.distcomm,
  //     rrn: TransactionResponse?.bankreferencenumber,
  //     amount: TransactionResponse?.amount,
  //     total_amount: TransactionResponse?.totalAmount ? TransactionResponse?.totalAmount : '0',
  //     sender_name: TransactionResponse?.customername,
  //     sender_mobile_number: TransactionResponse?.customermobileno,
  //     beneficiary_name: TransactionResponse?.payeename,
  //     beneficiary_id: TransactionResponse?.paymenttransactionrefid,
  //     account_number: TransactionResponse?.payeeaccountnumer,
  //     bank_name: TransactionResponse?.bankname,
  //     ifsc_code: TransactionResponse?.ifsc ? TransactionResponse?.ifsc : '',
  //     payment_transaction_type_refid: "1",
  //     pay_mode_ref_id: TransactionResponse?.paymode === 'IMPS' ? "1" : "0",
  //     agent_mobile: this.retailerMobileNo,
  //     agent_ref_id: this.retailerRefId,
  //     rrn_no: TransactionResponse.bankreferencenumber,
  //     transaction_status: TransactionResponse.transactionstatus,
  //     retailer_name: TransactionResponse.agentname,
  //     retailer_number: TransactionResponse.amobileno,
  //   };
  //   const modalRef = this.modalService.open(beneTransactionReceiptComponent, {
  //     ariaLabelledBy: "modal-basic-title",
  //     centered: true,
  //     backdrop: "static",
  //     keyboard: false,
  //   });
  //   modalRef.componentInstance.beneTransactionDetails =
  //     PrepareTransactionDetail;
  //   modalRef.result.then((result) => {
  //     if (result.length) {
  //     } else {
  //     }
  //   });
  // }
}
