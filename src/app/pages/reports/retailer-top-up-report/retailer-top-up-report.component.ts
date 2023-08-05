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

export interface PeriodicElement {
  transactionid?: string;
  customername?: string;
  payeename?: string;
  payeeaccountnumer?: string;
  paymode?: string;
  amount?: string;
}

@Component({
  selector: "app-retailer-top-up-report",
  templateUrl: "./retailer-top-up-report.component.html",
  styleUrls: ["./retailer-top-up-report.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class retailerTopUpReportComponent
  implements OnInit, AfterViewInit
{
  loading = false;
  loadingText = "Search";
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Transaction ID",
    "Retailer Mobile Number",
    "Retailer Name",
    "PG Receipt Link",
    "PG Created Link",
    "Link Created Date",
    "Link updated Date",
    "Amount",
    // "Created Date",
    "Sevice Charge",
    // "Updated Date",
    "Utr Number",
   
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  googleurl="www.google.com"
  fromDate = new Date();
  toDate = new Date();
  maxDate = new Date();
  retailerRefId = "";
  retailerMobileNo = "";
  searchValues="";
  noRecordFlag: boolean=true;
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
  constructor(
    private dmtService: DmtService,
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
      agent_ref_id: this.retailerRefId,
      search_option: this.searchByDefaultValue?.search_option,
      search_value: this.searchValue,
    };

    this.loading = true;
    this.dmtService.getRetailerTopUpReport(reportParam).subscribe(
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

  filterList(){
    if(this.searchValues == ''){
      this.dataSource.data = this.reportResult?.length
      ? this.reportResult
      : [];
      return;
    }

    let filterData= this.reportResult.length > 0 ? this.reportResult : [];
    if(filterData.length>0){
      filterData = filterData.filter(res =>
         (res.pg_link && res.pg_link.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
           (res.pg_Receipt_link && res.pg_Receipt_link.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.utR_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.updated_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.service_charge.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          // (res.created_date.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.amount.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.retailer_name.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.retailer_mobile_number.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1) ||
          (res.transaction_id.toLowerCase().indexOf(this.searchValues.toLowerCase()) > -1)
      );
      this.dataSource.data= filterData.length > 0 ? filterData :[];
    }
  }
  openLink(link){
    window.open(link);
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

  exportToExcel() {
    const heyReport = this.dataSource.filteredData.map((data: any) => {
      return {
        "Transaction ID": data.transaction_id,
        "Retailer Mobile Number": data.retailer_mobile_number,
        "Retailer Name": data.retailer_name,
        "Amount": data.amount,
        // "Created Date": data.created_date,
        "Sevice Charge": data.service_charge,
        // "updated_date": data.updated_date,
        "Utr Number": data.utR_number,
        "Link Created Date": data.linkCreateddate,
        "Link updated Date": data.linkprocessedDate,
        "PG Receipt Link": data.pg_Receipt_link,
        "PG Created Link": data.pg_link,
      };
    });

    if (heyReport.length) {
      const fileName = "top_up_report.xlsx";
      const worksheet = XLSX.utils.json_to_sheet(heyReport, {});
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, fileName);
    }
  }
}
