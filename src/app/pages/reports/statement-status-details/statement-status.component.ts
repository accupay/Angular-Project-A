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
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { KycModalComponent } from "../../modals/kyc-modal/kyc.component";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { beneTransactionReceiptComponent } from "../../modals/bene-transaction-receipt/bene-transaction-receipt.component";
import { Observable } from "rxjs";
import { CommonService } from "src/app/shared/services/common.service";

export interface PeriodicElement {
  transactionid?: string;
  customername?: string;
  payeename?: string;
  payeeaccountnumer?: string;
  paymode?: string;
  amount?: string;
}

@Component({
  selector: "app-statement-status",
  templateUrl: "./statement-status.component.html",
  styleUrls: ["./statement-status.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class StatementStatusComponent
  implements OnInit, AfterViewInit {
  loading = false;
  loadingText = "Search";
  progressBtn = "MOVE TO PROGRESS";
  kycBtn = "View Kyc";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Transaction ID",
    "Sender Name",
    "Sender Mobile Number",
    "Payee Name",
    "Account Number",
    "RRN Number",
    "Bank Name",
    "IFSC Code",
    "Catagory",
    "Payment Amount",
    "Transation Status",
    "Kyc Status",
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
    search_option: "1",
    name: "Pending",
  };
  searchValue = "";
  reportResult = [];
  headerIconbase64codeImage = "";
  myImage!: Observable<any>;
  constructor(
    private dmtService: DmtService,
    private modalService: NgbModal,
    private EncrDecr: EncrDecrService,
    private commonService: CommonService
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
    this.commonService.filetoBase64("assets/images/icon.png", (data) => {
      this.fetchHeaderIconBase64(data);
    });
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
      mobile_number: this.retailerMobileNo,
      transaction_status: this.searchByDefaultValue.search_option,
    };

    this.loading = true;
    this.dmtService.getStatementReportDetails(reportParam).subscribe(
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
        (res.amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.payment_category_type.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.ifsc.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.bank_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.account_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.payee_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.customer_mobile.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.customer_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.bank_reference_number && res.bank_reference_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.kyc_status.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_status.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
        (res.transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1)
      );
      this.dataSource.data = filterData.length > 0 ? filterData : [];
    }
  }

  changeClass() {
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if (disWidth <= 640) {
      this.noRecordFlag = false;
      this.progressBtn = "PROGRESS"
      return "container-fluid touchbar";
    } else {
      this.noRecordFlag = true;
      this.progressBtn = "MOVE TO PROGRESS"
      return "example-container";
    }
  }

  exportToExcel() {
    const heyReport = this.dataSource.filteredData.map((data: any) => {
      return {
        "Transaction ID": data.transaction_id,
        "Sender Name": data.customer_name,
        "Sender Mobile Number": data.customer_mobile,
        "Payee Name": data.payee_name,
        "Account Number": data.account_number,
        "RRN Number": data.bank_reference_number,
        "Bank Name": data.bank_name,
        "IFSC Code": data.ifsc,
        "Catagory": data.payment_category_type,
        "Payment Amount": data.amount,
        "Transation Status": data.transaction_status,
        "Kyc Status": data.kyc_status,
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

  moveToProgress(data) {
    const modalRef = this.modalService.open(
      KycModalComponent,
      {
        ariaLabelledBy: "modal-basic-title",
        centered: true,
        backdrop: "static",
        keyboard: false,
      }
    );
    modalRef.componentInstance.transactionDetails = data;
    modalRef.componentInstance.kycFlag = false;
    modalRef.result.then((result) => {
      if (result) {
        this.loading = false;
        Swal.fire({
          title: "Success!",
          text: "KYC progress to Upload!",
          icon: "success",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            this.searchTransaction();
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  viewKycModal(data, readWrite) {
    const modalRef = this.modalService.open(
      KycModalComponent,
      {
        ariaLabelledBy: "modal-basic-title",
        centered: true,
        backdrop: "static",
        keyboard: false,
      }
    );
    modalRef.componentInstance.transactionDetails = data;
    modalRef.componentInstance.kycFlag = true;
    modalRef.componentInstance.readable = readWrite === 'R' ? true : false;
    modalRef.result.then((result) => {
      if (result) {
        this.loading = false;
        Swal.fire({
          title: "Success!",
          text: "Verified KYC Upload!",
          icon: "success",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            this.searchTransaction();
          }
        });
      } else {
        this.loading = false;
        this.searchTransaction();
      }
    });
  }

  initiateReq(element) {
    const reportParam = {
      transactionID: element.transaction_id
    };

    this.loading = true;

    this.dmtService.fundTransferCustomer(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.loading = false;
          let msg = 'Success';
          this.printTransactionDetail(element, msg);
        } else {
          this.loading = false;
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  printTransactionDetail(TransactionResponse: any, msg: any) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;

    const PrepareTransactionDetail = {
      transaction_id: TransactionResponse?.transaction_id,
      transaction_date: TransactionResponse?.transaction_date ? TransactionResponse?.transaction_date : '',
      commision: TransactionResponse?.commision ? TransactionResponse?.commision : '',
      rrn: TransactionResponse?.bank_reference_number ? TransactionResponse?.bank_reference_number : '',
      amount: TransactionResponse?.amount ? TransactionResponse?.amount : '',
      total_amount: TransactionResponse?.totalAmount ? TransactionResponse?.totalAmount : '',
      sender_name: TransactionResponse.customer_name ? TransactionResponse?.customer_name : '',
      sender_mobile_number: TransactionResponse?.customer_mobile ? TransactionResponse?.customer_mobile : '',
      beneficiary_name: TransactionResponse?.payee_name ? TransactionResponse?.payee_name : '',
      beneficiary_id: TransactionResponse?.payee_ref_id ? TransactionResponse?.payee_ref_id : '',
      account_number: TransactionResponse?.account_number ? TransactionResponse?.account_number : '',
      bank_name: TransactionResponse?.bank_name ? TransactionResponse?.bank_name : '',
      ifsc_code: TransactionResponse.ifsc ? TransactionResponse?.ifsc : '',
      payment_transaction_type_refid: "1",
      pay_mode_ref_id: (TransactionResponse?.payment_mode && TransactionResponse?.payment_mode === 'IMPS') ? 1 : 2,
      agent_mobile: this.retailerMobileNo ? this.retailerMobileNo : '',
      agent_ref_id: this.retailerRefId ? TransactionResponse?.transaction_date : '',
      rrn_no: TransactionResponse.bank_reference_number ? TransactionResponse.bank_reference_number : TransactionResponse.rrn,
      transaction_status: (msg && msg !== '') ? msg : TransactionResponse.transaction_status ? TransactionResponse.transaction_status : '',
      retailer_name: retailerInfo?.retailer_name ? retailerInfo?.retailer_name : '',
      retailer_number: this.retailerMobileNo ? this.retailerMobileNo : '',
    };
    const modalRef = this.modalService.open(beneTransactionReceiptComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.beneTransactionDetails =
      PrepareTransactionDetail;
    modalRef.result.then((result) => {
      if (!result) {
        this.searchTransaction();
      }
    });
  }

  fetchHeaderIconBase64(data: any) {
    this.headerIconbase64codeImage = data;
  }
  print(element: any, print: any) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;

    const doc = new jsPDF();
    var imgData = this.headerIconbase64codeImage;
    doc.addImage(imgData, "PNG", 10, 10, 10, 10);
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text(
      "Transaction Details : " + element?.approval_date,
      25,
      15
    );

    autoTable(doc, {
      head: [
        [
          "Transaction ID",
          "#" + element?.transaction_id != "" &&
            element?.transaction_id != "undefined"
            ? element?.transaction_id
            : "-",
        ],
      ],
      margin: { top: 25 },
      tableWidth: 80,
      body: [
        ["Sender Name", element?.customer_name ? element?.customer_name : '-'],
        ["Sender Mobile Number", element?.customer_mobile ? element?.customer_mobile : '-'],
        ["Beneficiary Name", element.payee_name ? element.payee_name : "-"],
        ["Amount ", element?.amount ? element?.amount : '-'],
        ["Bank", element?.bank_name ? element?.bank_name : '-'],
        ["Account Number", element?.account_number ? element?.account_number : '-'],
        ["IFSC. Code", element?.ifsc ? element?.ifsc : '-'],
        ["Payment Mode ", element?.payment_mode ? element?.payment_mode : '-'],
        ["RRN No", element?.bank_reference_number ? element?.bank_reference_number : '-'],
        ["Retailer Name", retailerInfo?.retailer_name ? retailerInfo?.retailer_name : '-'],
        ["Retailer Number", this.retailerMobileNo ? this.retailerMobileNo : '-'],
        ["Transaction Status", element?.transaction_status === 'Success' ? 'Approved' : '-'],
      ],
      didDrawPage: function (data) {
        // Header
      },
    });
    const fileName =
      "transaction_" + element?.transaction_id;
    if (print == "1") {
      doc.autoPrint();
      doc.output("dataurlnewwindow");
    } else {
      doc.save(fileName);
    }

    return;
  }

}


