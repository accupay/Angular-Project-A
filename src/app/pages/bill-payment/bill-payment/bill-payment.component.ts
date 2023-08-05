import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, FormGroupDirective, NgForm } from "@angular/forms";
import { Observable } from 'rxjs';
import { PeriodicElement } from '../../reports/transaction-report/transaction-report.component';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { map, startWith } from 'rxjs/operators';
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { timeStamp } from 'console';
import { da } from 'date-fns/locale';
import { EncrDecrService } from 'src/app/shared/services/encr-decr.service';
import { environment } from 'src/environments/environment';
import { Customer } from '../../store/customer/customer.model';
import { RechargeService } from 'src/app/shared/services/recharge.service';
import { ResponseInterface } from 'src/app/shared/interface';
import Swal from 'sweetalert2';
import { BillPayComponent } from '../../modals/billPay/billPay.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CheckIfscComponent } from '../../modals/check-ifsc/check-ifsc.component';


function autocompleteStringValidator(validOptions: Array<string>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null  /* valid option selected */
    }
    return { 'invalidAutocompleteString': { value: control.value } }
  }
}
declare var $: any;
@Component({
  selector: "app-bill-payment",
  templateUrl: "./bill-payment.component.html",
  styleUrls: ["./bill-payment.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BillPaymentComponent implements OnInit {

  noRecordFlag: boolean = true;
  cardone: boolean = false;
  rechargeplans: PeriodicElement[] = [];
  customerBeneficiaries = [];

  customerForm!: any;
  billerDataForm!: FormGroup;
  BillerForm!: any;
  // catagoryForm: FormGroup;

  selectterms = {};
  searchText: string;
  listservice: any;
  labelname: any;
  records = [];
  selectbiller: boolean = false;
  matgroup: any;
  retailerRefId = "";
  retailerMobileNo = "";
  retailerName = "";
  detailText= "Customer Details";
  // catagoryList = [];
  // catagoryNameList=[];
  top5List = [];
  custDetailFlag: boolean = false;
  catagoryData: any = {};
  // stateList = [];
  stateData: any = {};
  // billerList = [];
  billerData: any = {};
  billerdataflag: boolean = false;
  billerflag: boolean = false;
  IFSCCode='';
  retailerInfo: any = {};
  lat: any;
  lon: any;
  macId="98-FA-9B-00-80-44";
  billerList = [];
  billerListConfig = {
    displayKey: "billerName",
    value: "billerName",
    limitTo: 5,
    placeholder: "Select Biller",
    noResultsFound: "No Bank found!",
    search: true,
  };

  stateList = [];
  stateListConfig = {
    displayKey: "state",
    value: "state",
    limitTo: 5,
    placeholder: "Select State",
    noResultsFound: "No Bank found!",
    search: true,
  };

  catagoryList = [];
  catagoryListConfig = {
    displayKey: "billerCategory",
    value: "billerCategory",
    limitTo: 10,
    placeholder: "Select Biller",
    noResultsFound: "No Bank found!",
    search: true,
  };
  nextTabFlag:boolean=false;
  selectedTab=0;
  constructor(
    private router: Router,
    private EncrDecr: EncrDecrService,
    public rechargeService: RechargeService,
    private modalService: NgbModal,
    private ngxService: NgxUiLoaderService

  ) {
    this.retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = this.retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = this.retailerInfo?.mobile_number;
    this.retailerName = this.retailerInfo?.retailer_name;
  }

  ngOnInit(): void {
    $('#firstId').hide();
    this.router.events.subscribe((event) => {
      if (
        event instanceof RouteConfigLoadStart ||
        event instanceof ResolveStart
      ) {


        // this.loading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        //this.loading = false;
      }
    });
    // this.filteredOptions = this.biller.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filter(value || '')),
    // );
    // this.getLocationDetails();
    this.initLoginForm();
    this.intbillerDataForm();
    this.getCatagory();
    // this.getTop5List();
    this.changeClass();
    // this.catagoryForm = new FormGroup({ selectservice: new FormControl("", [Validators.required]) });
    const billervalue = this.BillerForm?.billerval
    ? this.BillerForm?.billerval
    : "";
    this.BillerForm = new FormGroup({ billerval: new FormControl(billervalue, [Validators.required]) });

    setTimeout(() => {
      this.getPosition().then(pos=>
        {
          this.lat=pos.lat;
          this.lon=pos.lng
          //  console.log(`Positon: ${pos.lng} ${pos.lat}`);
        });
    },1000
    );
   
  }

  public initLoginForm(): void {

    const selectedlocation = this.customerForm?.location
    ? this.customerForm?.location
    : "";
    this.customerForm = new FormGroup({
      mobile_no: new FormControl("", [Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
      Validators.pattern(/^[6-9]/),]),
      location: new FormControl(selectedlocation, [Validators.required]),

    });
    this.customerForm.controls['location'].disable();
  }

  public intbillerDataForm(): void {
    this.billerDataForm = new FormGroup({
      // ifscCode: new  FormControl("", [Validators.required]),
      bpnumber1: new FormControl("", [Validators.required]),
      bpnumber2: new FormControl("", [Validators.required]),
      bpnumber3: new FormControl("", [Validators.required]),
      bpnumber4: new FormControl("", [Validators.required]),
      bpnumber5: new FormControl("", [Validators.required]),
    });
    // this.billerDataForm.controls['ifscCode'].disable();
  }


  //calling api's

  onTabChanged(data:any){
    // alert(data.index)
    if(data && data.index === 0){
          // this.ngOnInit();
          this.resetdata();
    }
  }


  getCatagory() {

    this.rechargeService.getBBCatagory().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            this.catagoryList = res.data;
            // this.catagoryList.map( res => {
            //   this.catagoryNameList.push(res.billerCategory);
            // });
          }
        } else {
          this.catagoryList = [];
          // this.catagoryNameList=[];
        }
      },
      (err) => {
        if (err.error.response_code === "200") {
          if (err.error.data.length > 0) {
            this.catagoryList = err.error.data;
          }
        } else {
          this.catagoryList = [];
          // this.catagoryNameList=[];
        }
      }
    );

  }

  getTop5List() {
    this.top5List = [];
    this.rechargeService.getBBTop5Catagory().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            this.top5List = res.data;
          }
        } else {
          this.top5List = [];
        }
      },
      (err) => {
        if (err.error.response_code === "200") {
          if (err.error.data.length > 0) {
            this.top5List = err.error.data;
          }
        } else {
          this.top5List = [];
        }
      }
    );
  }

  validateNo() {

    if (this.myError('customerForm', 'mobile_no', 'required') || this.myError('customerForm', 'mobile_no', 'pattern') ||
      this.myError('customerForm', 'mobile_no', 'maxlength') || this.myError('customerForm', 'mobile_no', 'minlength')) {
      this.customerForm.controls['location'].disable();
      // this.numberValidate=true;
    } else {
      this.customerForm.controls['location'].enable();
      // this.numberValidate=false;
    }
  }

  getlocationList(catId:any) {
    this.stateList = [];
    const stateparam = {categoryID : catId};
    this.rechargeService.getStateMaster(stateparam).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          if (res.data.length > 0) {
            this.stateList = res.data;
          }
        } else {
          this.stateList = [];
        }
      },
      (err) => {
        if (err.error.response_code === "200") {
          if (err.error.data.length > 0) {
            this.stateList = err.error.data;
          }
        } else {
          this.stateList = [];
        }
      }
    );
  }

  resetdata() {
    this.custDetailFlag = false;
    this.catagoryData = {};
    // this.stateList = [];
    this.stateData = {};
    this.billerList = [];
    this.billerData = {};
    this.billerdataflag = false;
    this.billerflag = false;
    this.initLoginForm();
    const billervalue = this.BillerForm?.billerval
    ? this.BillerForm?.billerval
    : "";
    this.BillerForm = new FormGroup({ billerval: new FormControl(billervalue, [Validators.required]) });
    this.intbillerDataForm();
  }

  //end
  // SearchFilter(event: any) {

  // }
  selectvalue(data) {
    this.resetdata();
    if (data && data !== undefined && data !== '') {
      let getData = this.top5List.filter(res => res.billerCategory === data);
      this.catagoryData = getData[0];
      this.custDetailFlag = true;
      // this.catagoryForm.controls['selectservice'].setValue(data);
      this.getlocationList(this.catagoryData.billerCategoryID);
    } else {
      this.catagoryData = {};
      this.custDetailFlag = false;
    }

  }
  selectServiceChange(val) {
    this.resetdata();
    if (val && val.value !== undefined && val.value !== '') {
      let getData = this.catagoryList.filter(res => res.billerCategory === val.value);
      this.catagoryData = getData[0];
      this.custDetailFlag = true;
      this.getlocationList(this.catagoryData.billerCategoryID);
    } else {
      this.custDetailFlag = false;
      this.catagoryData = {};
    }
    // console.log(listservice);
    // console.log(listservice.value);


  }

  selectState(data) {
    this.billerdataflag = false;
    this.billerflag = false;
    this.stateData = {};
    if (data.value.state && data.value.state !== '') {
      // let getData = this.stateList.filter(res => res.state === data.value.state);
      this.stateData = data.value;
      const dataParam = {
        locationID: this.stateData.state_ID,
        categoryID: this.catagoryData.billerCategoryID
      };
      this.rechargeService.getBillerData(dataParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.billerflag = true;
            if (res.data.length > 0) {
              this.billerList = res.data;
            }
          } else {
            this.billerList = [];
          }
        },
        (err) => {
          this.billerflag = false;
          if (err.error.response_code === "200") {
            if (err.error.data.length > 0) {
              this.billerList = err.error.data;
            }
          } else {
            this.billerList = [];
          }
        }
      );
    } else {
      this.billerList = [];
    }


  }
  reIntiBillerForm(data:any){
    // let reg1=data.regex1.replaceAll(" ","");
    this.billerDataForm = new FormGroup({
      // ifscCode:new FormControl("", [Validators.required]),
      bpnumber1: new FormControl("", [
        Validators.required,
        Validators.maxLength(data.maxlimit1),
        Validators.minLength(data.minlimit1),
        // Validators.pattern(data.regex1),
        Validators.pattern(data.regex1.replaceAll(" ","")),
      ]),
      bpnumber2: new FormControl("", [
        Validators.required ,
        Validators.maxLength(data.maxlimit2),
        Validators.minLength(data.minlimit2),
        Validators.pattern(data.regex2.replaceAll(" ","")),
      ]),
      bpnumber3: new FormControl("", [
        Validators.required,
        Validators.maxLength(data.maxlimit3),
        Validators.minLength(data.minlimit3),
        Validators.pattern(data.regex3.replaceAll(" ","")),
      ]),
      bpnumber4: new FormControl("", [
        Validators.required,
        Validators.maxLength(data.maxlimit4),
        Validators.minLength(data.minlimit4),
        Validators.pattern(data.regex4.replaceAll(" ","")),
      ]),
      bpnumber5: new FormControl("", [
        Validators.required,
        Validators.maxLength(data.maxlimit5),
        Validators.minLength(data.minlimit5),
        Validators.pattern(data.regex5.replaceAll(" ","")),
      ]),
    });
    // this.billerDataForm.controls['ifscCode'].disable();
  }


  fetchmethod() {
    if(this.billerData.textboxDescription1 === ''){
      this.billerDataForm.controls['bpnumber1'].disable();
      
    }
    if(this.billerData.textboxDescription2 === ''){
      this.billerDataForm.controls['bpnumber2'].disable();
      
    }
    if(this.billerData.textboxDescription3 === ''){
      this.billerDataForm.controls['bpnumber3'].disable();
     
    }
    if(this.billerData.textboxDescription4 === ''){
      this.billerDataForm.controls['bpnumber4'].disable();
    
    }
    if(this.billerData.textboxDescription5 === ''){
      this.billerDataForm.controls['bpnumber5'].disable();
     
    }
    let agent_ip= localStorage.getItem("current_ip");
    // let macID = localStorage.getItem("machineId");
    let macID = this.macId;
    // let ifscval = this.billerDataForm.controls['ifscCode'].value;
    if(this.billerDataForm.invalid){
      return;
    }
    let custMobNo = this.customerForm.controls['mobile_no'].value;
    let billerId = this.billerData.billerID;
    let textcount = 0;
    for (let i = 1; i < 6; i++) {
      let name = "bpnumber" + i;
      if (this.billerDataForm.controls[name].value && this.billerDataForm.controls[name].value !== '') {
        textcount++;
      }
    }
    let billvalidation = this.billerData.supportBillValidation;

    const fetchParam = {
      msgid: "",
      customer_mobile: custMobNo,
      billerid: billerId,
      textboxname1: this.billerData.textboxDescription1 && this.billerData.textboxDescription1 !== '' ? this.billerData.textboxDescription1 : "NA",
      textboxname2: this.billerData.textboxDescription2 && this.billerData.textboxDescription2 !== '' ? this.billerData.textboxDescription2 : "NA",
      textboxname3: this.billerData.textboxDescription3 && this.billerData.textboxDescription3 !== '' ? this.billerData.textboxDescription3 : "NA",
      textboxname4: this.billerData.textboxDescription4 && this.billerData.textboxDescription4 !== '' ? this.billerData.textboxDescription4 : "NA",
      textboxname5: this.billerData.textboxDescription5 && this.billerData.textboxDescription5 !== '' ? this.billerData.textboxDescription5 : "NA",
      textboxvalue1: this.billerDataForm.controls['bpnumber1'].value && this.billerDataForm.controls['bpnumber1'].value !== '' ? this.billerDataForm.controls['bpnumber1'].value : "NA", //31232327
      textboxvalue2: this.billerDataForm.controls['bpnumber2'].value && this.billerDataForm.controls['bpnumber2'].value !== '' ? this.billerDataForm.controls['bpnumber2'].value : "NA",
      textboxvalue3: this.billerDataForm.controls['bpnumber3'].value && this.billerDataForm.controls['bpnumber3'].value !== '' ? this.billerDataForm.controls['bpnumber3'].value : "NA",
      textboxvalue4: this.billerDataForm.controls['bpnumber4'].value && this.billerDataForm.controls['bpnumber4'].value !== '' ? this.billerDataForm.controls['bpnumber4'].value : "NA",
      textboxvalue5: this.billerDataForm.controls['bpnumber5'].value && this.billerDataForm.controls['bpnumber5'].value !== '' ? this.billerDataForm.controls['bpnumber5'].value : "NA",
      nooftextbox: textcount + "",
      billvalidation: billvalidation,
      agentMobileNo: this.retailerInfo?.mobile_number,
      agentRefID: this.retailerRefId,
      aptTransactionID: "",
      billerTransactionID: "",
      amount: "",
      dueDate: "",
      billDate: "",
      billNumber: "",
      billPeriod: "",
      userRefID: environment.account_type_ref_id,
      customername: "",
      fetchRequest: "",
      fetchResponse: "",
      validateFetchRequest: "",
      validateFetchResponse: "",
      ifscCode: '', // ifscval, //"HDFC0001947",
      postalCode: this.retailerInfo?.pincode,
      geoCode: "",
      approvalrefno: "",
      latitude: this.lat + '',
      longitude: this.lon + '',
      mac:macID,
      ip:agent_ip,
      fetchrequirement: this.billerData.fetchRequirement
    }
    this.ngxService.start();
    this.rechargeService.fetchData(fetchParam).subscribe(
      (res: any) => {
        this.ngxService.stop();
        if (res.response_code === "200" && res.billertransactionID &&  res.response_message === "Success") {
          // if (res.response_code === "200" ) {
          const billParam= {
            billperiod: res.billperiod,
            customerName:res.customerName,
            duedate:res.duedate,
            billertransactionID: res.billertransactionID,
            billdate: res.billdate,
            billNumber: res.billNumber,
            aptTransactionID: res.aptTransactionID,
            amount : res.amount,
            lat: this.lat,
            lon:this.lon,
            pincode: this.retailerInfo?.pincode,
            ifscCode:'', // ifscval, //"HDFC0001947",
            amountEdit: this.billerData.billerAcceptsAdhoc && this.billerData.billerAcceptsAdhoc === '1' ? true : false,
            billerCategoryID:this.billerData.billerCategoryID,
            billerCategory: this.billerData.billerCategory,
            billerName:this.billerData.billerName
          }
          const modalRef = this.modalService.open(BillPayComponent, {
            ariaLabelledBy: "modal-basic-title",
            centered: true,
            backdrop: "static",
            keyboard: false,
          });
          modalRef.componentInstance.fetchData = billParam;
          modalRef.componentInstance.transactionDetails = fetchParam;
          modalRef.result.then((result) => {
            if (result) {
              this.resetdata();
              this.initLoginForm();
              this.custDetailFlag=false;
              this.selectedTab=0;
              this.detailText="Customer Details";
              // this.catagoryForm = new FormGroup({ selectservice: new FormControl("", [Validators.required]) });
              const billervalue = this.BillerForm?.billerval
              ? this.BillerForm?.billerval
              : "";
              this.BillerForm = new FormGroup({ billerval: new FormControl(billervalue, [Validators.required]) });
            } 
          });
         
        } else {

        
          Swal.fire({
            title: "Error!" ,
            text:res.response_message,
            // html:"<img src='" + './assets/images/billpayment/B-Assured.png' + "' style='width:50px; heigth:50px'>",
            // icon: "error",
            imageUrl: "./assets/images/billpayment/B-Assured.png",
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: "Custom image",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
            allowOutsideClick: false,
            backdrop: true,
          });
          
        $(".swal2-modal").css('background-color', 'white');
        }
      },
      (err) => {
        this.ngxService.stop();
        this.billerflag = false;

        this.billerList = [];

      }
    );
    // console.log(fetchParam);
  }

  notSureIfsc() {
    const modalRef = this.modalService.open(CheckIfscComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });

    // this.beneficiary = this.beneficiaryRegitrationForm.value;
    // modalRef.componentInstance.beneFormData = this.beneficiary;
    modalRef.componentInstance.conformationFlag = true;
    modalRef.result.then((result) => {
      if (result.length) {
        this.IFSCCode = result[0]?.ifsc_code;
        // this.billerDataForm.controls['ifscCode'].setValue(this.IFSCCode);
      
      } else {
        // this.loading = false;
      }
    });
  }


  billerselect(data: any) {
    if (data.value.billerName && data.value.billerName !== '') {
      // let getData = this.billerList.filter(res => res.billerName === data.value);
      this.billerData = data.value;
      this.billerdataflag = true;
      this.reIntiBillerForm(this.billerData);
    } else {
      this.billerData = {};
      this.billerdataflag = false;
    }
    // if (event.option.value == 'ashvFinance') {
    //   this.labelname = "BpNumber"
    //   window.scrollTo(0, document.body.scrollHeight);
    //   el.selectedIndex += 1;
    // }
    // else if (event.option.value == 'axis Bank Ltd - MCA') {
    //   this.labelname = "Booking Id"
    //   window.scrollTo(0, document.body.scrollHeight);
    //   el.selectedIndex += 1;
    // }
    // else if (event.option.value == 'andhra Pragathi Grameena Bank Loan Repayment') {
    //   this.labelname = "Bill Id"
    //   window.scrollTo(0, document.body.scrollHeight);
    //   el.selectedIndex += 1;
    // }
    // else if (event.option.value == 'aris Capital Pvt Limited') {
    //   this.labelname = 'Unique Identification No'
    //   window.scrollTo(0, document.body.scrollHeight);
    //   el.selectedIndex += 1;
    // }
  }


  // setValid(controlName: string) {

  //   this.rechargeForm.controls[controlName].markAsPristine();
  //   this.rechargeForm.controls[controlName].markAsUntouched();
  // }
  // setError(controlName: string) {

  //   this.rechargeForm.controls[controlName].markAsDirty();
  //   this.rechargeForm.controls[controlName].markAsTouched();
  // }

  public myError = (formName: string, controlName: string, errorName: string) => {
    // if (formName === 'catagoryForm') {
    //   return this.catagoryForm.controls[controlName].hasError(errorName);
    // } else 
    if (formName === 'customerForm') {
      return this.customerForm.controls[controlName].hasError(errorName);
    } else if (formName === 'BillerForm') {
      return this.BillerForm.controls.billerval.hasError(errorName);
    } else if (formName === 'billerDataForm') {
      return this.billerDataForm.controls[controlName].hasError(errorName);
    } else {
      return false;
    }

  }
  getPosition(): Promise<any>
  {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          reject(err);
        });
    });

  }

  getLocationDetails() {
    const status = document.querySelector('.status');

    const success = (position) => {
      console.log(position);
      const latitude = this.lat = position.coords.latitude;
      const longitude = this.lon = position.coords.longitude;

    }

    const error = () => {
      status.textContent = 'unable to retrive your location';
    }

    navigator.geolocation.getCurrentPosition(success, error);

  }

  selectedImg(imgName:string){
    // alert(imgName);
    // let selectImgdata = this.catagoryList
    this.resetdata();
    if (imgName && imgName !== undefined && imgName !== '') {
      let getData = this.catagoryList.filter(res => res.billerCategory === imgName);
      this.catagoryData = getData[0];
      // alert(getData.length)
      this.nextTabFlag=true;
      this.custDetailFlag = true;
      this.getlocationList(this.catagoryData.billerCategoryID);
      this.selectedTab=1;
      this.detailText= imgName;
      // $('#firstTab').removeClass("active");
      // $('#secondTab').addClass("active");
    } else {
      this.custDetailFlag = false;
      this.catagoryData = {};
    }

  }

  changeClass() {
    var disWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log(disWidth);
    if (disWidth <= 640) {
      this.noRecordFlag = false;
      return "row touch-act";
    } else {
      this.noRecordFlag = true;
      return "row touch-act";
    }
  }

  get billerval() {
    return this.BillerForm.get("billerval")!;
  }

  get location() {
    return this.customerForm.get("location")!;
  }

  // get selectservice() {
  //   return this.catagoryForm.get("selectservice")!;
  // }
}
