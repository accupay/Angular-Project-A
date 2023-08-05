import { Component, HostBinding, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddAccountComponent } from "../../modals/add-account/add-account.component";
import { Customer } from "../../store/customer/customer.model";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { DmtService } from "src/app/shared/services/dmt.service";
import { ResponseInterface } from "src/app/shared/interface";



export interface PeriodicElement {
  bank?: string;
  accountNumber?: string;
  accountName?: string;
  ifsc?: string;
  status?: string;
}

@Component({
  selector: "app-bankInfo",
  templateUrl: "./bankInfo.component.html",
  styleUrls: ["./bankInfo.component.scss"],
})
export class BankInfoComponent implements OnInit {
  
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Bank",
    "Account Name",
    "Account Number",
    "IFSC Code",
    "Status",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  noRecordFlag : boolean =false;
  retailerMobileNo='';
  retailerRefId='';
  reportResult=[];
  constructor(
    private modalService: NgbModal,
    private EncrDecr: EncrDecrService,
    private dmtService: DmtService,
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  @HostBinding("class") classes = "apt-session-page";

  ngOnInit() {
    this.dataSource.sort = this.sort;
    setTimeout(() => {
      this.searchTransaction();
    }, 100);
    
  }

  searchTransaction() {
    const reportParam = {
      agent_ref_id: this.retailerRefId,
    };

    this.dmtService.getViewAccount(reportParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          // this.loading = false;
          this.reportResult = res?.data;
          this.dataSource.data = this.reportResult?.length
            ? this.reportResult
            : [];
        } else {
          // this.loading = false;
          this.dataSource.data = [];
        }
      },
      (err) => {
        // this.loading = false;
        this.dataSource.data = [];
      }
    );
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
  
  addAccount() {
    const modalRef = this.modalService.open(AddAccountComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.result.then((result) => {
      if (result) {
        setTimeout(() => {
          this.searchTransaction();
        }, 100);
      } else {
      }
    });
  }
}
