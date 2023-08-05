import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators, FormGroupDirective, NgForm } from "@angular/forms";
import * as moment from "moment";
// import { PeriodicElement } from '../../reports/transaction-report/transaction-report.component';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { RechargeService } from 'src/app/shared/services/recharge.service';
import { ResponseInterface } from 'src/app/shared/interface';
import { Customer } from '../../store/customer/customer.model';
import { environment } from 'src/environments/environment';
import { EncrDecrService } from 'src/app/shared/services/encr-decr.service';
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface PeriodicElement {
  price?: string;
  talktime?: string;
  name?: string;
  description?: string;
  validity_string?: string;
}
@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.scss'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})
export class RechargeComponent implements OnInit, AfterViewInit {
  noRecordFlag: boolean = true;
  showMyContainer: boolean = false;
  rechargeplans: PeriodicElement[] = [];
  customerBeneficiaries = [];
  rechargeForm: FormGroup;
  recharge_operator_ref_id = '';
  recharge_type_ref_id = '';
  product_key = '';
  vendor_ref_id = '';
  // dthrechargeForm: FormGroup;
  transactionData: PeriodicElement[] = [];
  displayedColumns: string[] = [
    "Amount",
    "Talktime",
    "Name",
    "Validity",
    "Description",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(this.transactionData);
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  rechargeTypeList = [];
  planList = [];
  operatorList = [];
  planTopupType: any;
  lat: any;
  lon: any;
  result: Promise<any>;
  postCode = '';
  currentTabId = 0;
  currentTabDesc = '';
  retailerLookUp: any;
  transaction_id: any;
  checkList = [];
  numberValidate: boolean = false;
  // @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @ViewChild(MatPaginator) paginator: MatPaginator;

  iconMap = new Map;

  constructor(
    public rechargeService: RechargeService,
    private EncrDecr: EncrDecrService,
    public datepipe: DatePipe,
    private ngxService: NgxUiLoaderService,
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerLookUp = retailerInfo;
  }

  ngOnInit(): void {
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.iconMap.set('Airtel', './assets/images/airtel.png');
    this.iconMap.set('Vi', './assets/images/vi.png');
    this.iconMap.set('Jio', './assets/images/jio.png');
    this.iconMap.set('BSNL', './assets/images/bsnl.png');

    this.iconMap.set('Videocon D2h', './assets/images/videoconDth.png');
    this.iconMap.set('Tata Sky', './assets/images/tataSkyDth.png');
    this.iconMap.set('Sun Direct', './assets/images/sundirectDth.png');
    this.iconMap.set('Dish TV', './assets/images/dishtvDth.png');
    this.iconMap.set('Airtel Digital TV', './assets/images/airtelDth.png');

    this.intiForm();
    this.getTapList();
    // this.getPlanList();
    this.getLocationDetails();

  }
  intiForm() {
    this.rechargeForm = new FormGroup({

      re_mobile_no: new FormControl("", [Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
      Validators.pattern(/^[6-9]/),]),
      re_amount: new FormControl("", [Validators.required]),
      recharge_Type: new FormControl("", [Validators.required]),
      re_operator: new FormControl("", [Validators.required]),
    });

    this.rechargeForm.controls['re_operator'].disable();
    this.dataSource.data = [];
  }
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.paginator = this.paginator; // For pagination
    // this.dataSource.sort = this.sort; // For sort
    setTimeout(() => this.dataSource.paginator = this.paginator);
  }


  //
  getTapList() {
    this.rechargeService.getRechargeType().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            this.rechargeTypeList = res.data;
            // alert(this.rechargeTypeList[0].recharge_type);
            this.checkList[0] = true;
            this.currentTabDesc = this.rechargeTypeList[0].recharge_type;
            this.currentTabId = this.rechargeTypeList[0].recharger_type_ref_id;
            this.getOperatorList();
            this.rechargeForm.controls['recharge_Type'].setValue(this.rechargeTypeList[0].recharge_type);
          }
        } else {
          this.rechargeTypeList = [];
        }
      },
      (err) => {
        if (err.error.response_code === "200") {
          this.rechargeTypeList = err.error.data;
          // alert(this.rechargeTypeList[0].recharge_type);
          this.checkList[0] = true;
          this.currentTabDesc = this.rechargeTypeList[0].recharge_type;
          this.currentTabId = this.rechargeTypeList[0].recharger_type_ref_id;
          this.getOperatorList();
        }
      }
    );
  }
  validateNo() {

    if (this.myError('re_mobile_no', 'required') || this.myError('re_mobile_no', 'pattern') ||
      this.myError('re_mobile_no', 'maxlength') || this.myError('re_mobile_no', 'minlength')) {
      this.rechargeForm.controls['re_operator'].disable();
      // this.numberValidate=true;
    } else {
      this.rechargeForm.controls['re_operator'].enable();
      // this.numberValidate=false;
    }
  }

  getPlanList() {

    this.rechargeService.getPlanList().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "0") {
          if (res.data.length > 0) {
            this.planList = res.data;
            this.dataSource = new MatTableDataSource(this.planList);
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }, 200);
            // setTimeout(() => {
            //   // this.dataSource.data = this.planList.length > 0 ? this.planList : [];
            //   this.dataSource.paginator = this.paginator;
            //   this.dataSource.sort = this.sort; // For sort
            // }, 100);

          }
        } else {
          this.planList = [];
          this.dataSource.data = [];
        }
      },
      (err) => {
        this.dataSource.data = [];
        this.planList = [];
      }
    );
  }

  getOperatorList() {

    this.rechargeService.getOperatorList(this.currentTabId).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            this.operatorList = res.data;
          }
        } else {
          this.operatorList = [];
        }
      },
      (err) => {
        if (err.error.response_code === "200") {
          if (err.error.data.length > 0) {
            this.operatorList = err.error.data;
          }
        }
      }
    );
  }

  //

  proceedToPay(data: any) {
    if (data.valid) {
      let operObj = this.operatorList.filter(res => res.recharge_operator_ref_id === data.value.re_operator);
      let date = new Date();
      let latest_date = this.datepipe.transform(date, 'dd-MMM-yyyy');
      Swal.fire({
        title: "Are you sure to proceed?",
        html:
          "Operator: <span style='color:#1172b3'>" + operObj[0].recharge_operator + "</span> " +
          "</br> Customer Mobile Number: <span style='color:#1172b3'>" + data.value.re_mobile_no + "</span> " +
          "</br> Amount: &#8377;  <span style='color:#1172b3'>" + data.value.re_amount + "</span> ",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1172b3",
        cancelButtonColor: "#DD6B55",
        allowOutsideClick: false,
        confirmButtonText: "Ok",
        cancelButtonText: 'Cancel',
        backdrop: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const payParam = {
            recharge_vendor_ref_id: this.vendor_ref_id,
            recharge_operator_ref_id: this.recharge_operator_ref_id,
            recharge_type_ref_id: this.recharge_type_ref_id,
            amount: data.value.re_amount,
            customer_mobile_no: data.value.re_mobile_no,
            agent_mobile_no: this.retailerLookUp?.mobile_number,
            agent_ref_id: this.retailerLookUp?.retailer_ref_id,
            user_ref_id: environment.account_type_ref_id,
            spkey: this.product_key,
            lat: this.lat + '',
            longs: this.lon + '',
            pincode: this.retailerLookUp?.pincode,
          };
          this.ngxService.start();
          this.rechargeService.getRechargePayment(payParam).subscribe(
            (res: any) => {
              this.ngxService.stop();
              if (res.response_code === "200" && res.transaction_id) {
                // this.transaction_id = res.transaction_id;
                Swal.fire({
                  title: "Success!",
                  text: "Transaction status: Success",
                  html:
                    "Transaction Id: <span style='color:#1172b3'>" + res.transaction_id + "</span> " +
                    "</br> Mobile Number: <span style='color:#1172b3'>" + data.value.re_mobile_no + "</span> " +
                    "</br> Amount: &#8377; <span style='color:#1172b3'>" + data.value.re_amount + "</span> " +
                    "</br> Transaction Date: <span style='color:#1172b3'>" + latest_date + "</span> ",
                  icon: "success",
                  confirmButtonColor: "#1172b3",
                  confirmButtonText: "Ok",
                  allowOutsideClick: false,
                  backdrop: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.intiForm();
                    this.selecttap(this.currentTabDesc);
                    // this.rechargeForm.controls['recharge_Type'].setValue(this.currentTabDesc);
                    // window.location.reload();
                  }
                });
              } else {

                Swal.fire({
                  title: "Error!",
                  text: res.response_description  ,
                  icon: "error",
                  confirmButtonColor: "#1172b3",
                  confirmButtonText: "Ok",
                  allowOutsideClick: false,
                  backdrop: true,
                });
                // this.transaction_id = '';
                // this.recharge_operator_ref_id = '';
                // this.recharge_type_ref_id = '';
                // this.vendor_ref_id = '';
                // this.product_key = '';
                // this.showMyContainer = false;
              }
            },
            (err) => {
              this.ngxService.stop();
              Swal.fire({
                title: err.error.response_description,
                // text: err.error.response_description,
                icon: "error",
                confirmButtonColor: "#1172b3",
                confirmButtonText: "Ok",
                allowOutsideClick: false,
                backdrop: true,
              });
              // this.operatorList = [];
            }
          );
        }
      });

    }

  }

  selecttap(val: any) {
    this.recharge_operator_ref_id = '';
    this.recharge_type_ref_id = '';
    this.vendor_ref_id = '';
    this.product_key = '';
    // let tabObj = this.rechargeTypeList.filter(res => res.recharge_type === val.tab.textLabel);
    let tabObj = this.rechargeTypeList.filter(res => res.recharge_type === val.value);
    this.currentTabId = tabObj[0].recharger_type_ref_id ? Number(tabObj[0].recharger_type_ref_id) : 0;
    this.currentTabDesc = tabObj[0].recharge_type ? tabObj[0].recharge_type : '';
    this.getOperatorList();
    this.intiForm();
    this.rechargeForm.controls['recharge_Type'].setValue(this.currentTabDesc);
    this.showMyContainer = false;
    if (this.currentTabDesc === 'DTH') {
      this.rechargeForm.controls['re_operator'].enable();
      this.rechargeForm.controls[
        "re_mobile_no"
      ].setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15),
      ]);
    } else {
      this.rechargeForm.controls['re_operator'].disable();
      this.rechargeForm.controls[
        "re_mobile_no"
      ].setValidators([
        Validators.maxLength(10),
        Validators.minLength(10),
        Validators.pattern(/^[6-9]/)
      ]);
    }

  }
  selectPlans(event) {
    this.rechargeForm.controls['recharge_Type'].setValue(this.currentTabDesc);
    if (event.value) {
      let operatorObj = this.operatorList.filter(resp => resp.recharge_operator_ref_id === event.value);
      if (operatorObj) {
        this.recharge_operator_ref_id = operatorObj[0].recharge_operator_ref_id;
        this.recharge_type_ref_id = operatorObj[0].recharge_type_ref_id;
        this.vendor_ref_id = operatorObj[0].vendor_ref_id;
        this.product_key = operatorObj[0].product_key;
        this.showMyContainer = true;
        this.getPlanTypeList();
      } else {
        this.recharge_operator_ref_id = '';
        this.recharge_type_ref_id = '';
        this.vendor_ref_id = '';
        this.product_key = '';
        this.showMyContainer = false;
      }
    }
    else {
      this.recharge_operator_ref_id = '';
      this.recharge_type_ref_id = '';
      this.vendor_ref_id = '';
      this.product_key = '';
      this.showMyContainer = false;
      if (this.currentTabDesc !== 'Postpaid' && this.currentTabDesc !== 'Prepaid') {
        this.intiForm();
      }

    }
  }

  selectPlan(data) {
    // alert(data.tab.textLabel);
    if (this.planList && this.planList.length > 0) {
      // this.planTopupType = this.planList.filter(resp => resp.recharge_topup_type === data.tab.textLabel);
      let dataObj = this.planList.filter(resp => resp.recharge_topup_type === data.tab.textLabel);
      this.planTopupType = dataObj[0];
      // alert(this.planTopupType.recharge_topup_type);
      this.getDataList();
    }

  }

  getDataList() {

    const dataParam = {
      topup_type: this.planTopupType.recharge_topup_type,
      sp_key: this.product_key,
      recharge_type: this.recharge_type_ref_id,
    };
    // let reTypeId = Number(this.recharge_type_ref_id);
    this.rechargeService.getPlan(dataParam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            // this.planList = res.data;
            setTimeout(() => {
              this.dataSource.data = res.data.length > 0 ? res.data : [];
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort; // For sort
            }, 100);

          }
        } else {
          // this.planList = [];
          this.dataSource.data = [];
        }
      },
      (err) => {
        this.dataSource.data = [];
        // this.planList = [];
      }
    );

  }

  getPlanTypeList() {
    if (this.recharge_type_ref_id && this.recharge_type_ref_id !== '') {
      let reTypeId = Number(this.recharge_type_ref_id);
      this.rechargeService.getTopupPlanList(reTypeId).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            if (res.data.length > 0) {
              this.planList = res.data;
              // this.dataSource.data = this.planList.length > 0 ? this.planList : [];
              this.planTopupType = this.planList[0];
              this.getDataList();
            }
          } else {
            this.planList = [];
            this.dataSource.data = [];
            this.planTopupType = {};
          }
        },
        (err) => {
          this.dataSource.data = [];
          this.planList = [];
          this.planTopupType = {};
        }
      );
    }

  }

  setAmountValue(amt: any) {
    this.rechargeForm.controls['re_amount'].setValue(amt);
  }

  changeClass() {
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if (disWidth <= 640) {
      this.noRecordFlag = false;
      return "container-fluid touchbar";
    } else {
      this.noRecordFlag = true;
      return "example-container customTable";
    }
  }
  public myError = (controlName: string, errorName: string) => {
    return this.rechargeForm.controls[controlName].hasError(errorName);
  }

  getLocationDetails() {
    const status = document.querySelector('.status');

    const success = (position) => {
      console.log(position);
      const latitude = this.lat = position.coords.latitude;
      const longitude = this.lon = position.coords.longitude;

      // const geoApiUrl = 'http://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en'
      // fetch(geoApiUrl)
      //   .then(res => res.json())
      //   .then(data => {
      //     console.log('Add:  ' + JSON.stringify(data))
      //     this.postCode = data.postcode ? data.postcode : '';
      //   })

    }

    const error = () => {
      status.textContent = 'unable to retrive your location';
    }

    navigator.geolocation.getCurrentPosition(success, error);

  }

  get re_mobile_no() {
    return this.rechargeForm.get("re_mobile_no")!;
  }

  get re_amount() {
    return this.rechargeForm.get("re_amount")!;
  }
  get re_operator() {
    return this.rechargeForm.get("re_operator")!;
  }
  get recharge_Type() {
    return this.rechargeForm.get("recharge_Type")!;
  }

}

