import {
  Component,
  HostBinding,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ResponseInterface } from "src/app/shared/interface";
import { CacheService } from "src/app/shared/services/cache-service";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { ValidateRegisterCustomerOtpComponent } from "../../modals/validate-register-customer-otp/validate-register-customer-otp.component";
import { Customer } from "../../store/customer/customer.model";

interface ICustomer {
  customer_name: string;
  mobile_no: string;
  last_name?: string;
  agent_mobile_no: string;
  address1: string;
  address2: string;
  email: string;
  state_ref_id: string;
  state: any;
  city: string;
  district: string;
  gender: string;
  dob: string;
  otp_validation_flag: string;
  agent_ref_id: string;
  pincode: string;
  location_ref_id: string;
  flag: string;
  bank_id: string;
  bank_ref_id: string;
  account_type: string;
}

@Component({
  selector: "app-customer-registration",
  templateUrl: "./customer-registration.component.html",
  styleUrls: ["./customer-registration.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CustomerRegistrationComponent implements OnInit {
  loading: boolean;
  loadingText = "Proceed";

  customerRegitrationForm!: FormGroup;
  customer: ICustomer;
  today = new Date();

  areaConfig = {
    displayKey: "area",
    value: "location_ref_id",
    search: true,
    limitTo: 2,
    placeholder: "Select area",
    searchPlaceholder: "Search",
    noResultsFound: "No Area found!",
  };
  areaList = [];

  districtConfig = {
    displayKey: "district",
    value: "location_ref_id",
    limitTo: 2,
    placeholder: "Select District",
    noResultsFound: "No District found!",
  };
  districtList = [];

  stateConfig = {
    displayKey: "state",
    value: "location_ref_id",
    limitTo: 2,
    placeholder: "Select area",
    noResultsFound: "No Area found!",
  };
  stateList = [];

  currentCustomerMobileNumber;
  retailerRefId = "";
  retailerMobileNo = "";
  constructor(
    private cacheService: CacheService,
    private EncrDecr: EncrDecrService,
    private dmtService: DmtService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.customer = {} as ICustomer;
    // Fetch Current Customer Mobile No
    this.currentCustomerMobileNumber = this.EncrDecr.get(
      environment.dataEncrptionCode,
      sessionStorage.getItem("atp_c_m_n")
    );
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
  }
  @HostBinding("class") classes = "apt-customer-registration";

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (
        event instanceof RouteConfigLoadStart ||
        event instanceof ResolveStart
      ) {
        this.loadingText = "Loading Dashboard Module...";
        this.loading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.loading = false;
      }
    });

    this.initCustomerForm();
  }

  public initCustomerForm(): void {
    this.customerRegitrationForm = new FormGroup({
      customer_name: new FormControl("", [
        Validators.required,
          Validators.pattern(/^[a-zA-Z0-9 ]*$/),
          Validators.minLength(5),      
      ]),
      // last_name: new FormControl("", [Validators.required]),
      mobile_no: new FormControl(this.currentCustomerMobileNumber, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      address1: new FormControl("", [Validators.required]),
      pincode: new FormControl("", [Validators.required]),
      state: new FormControl(""),
      // gender: new FormControl("Male"),
      // city: new FormControl("", [Validators.required]),
      // area: new FormControl("", [Validators.required]),
      // dob: new FormControl(new Date(), [Validators.required]),
      // address2: new FormControl(""),
      // email: new FormControl("", [Validators.email, Validators.required]),
      // state: new FormControl("", [Validators.required]),
      last_name: new FormControl(""),
      gender: new FormControl("Male"),
      city: new FormControl(""),
      area: new FormControl(""),
      dob: new FormControl(new Date()),
      address2: new FormControl(""),
      email: new FormControl(""),
    });
  }

  customerRegitrationSubmit() {
    this.customer = this.customerRegitrationForm.value;
    if (this.customerRegitrationForm.invalid) {
      for (const control of Object.keys(
        this.customerRegitrationForm.controls
      )) {
        this.customerRegitrationForm.controls[control].markAsTouched();
      }
      return;
    }
    this.customer = this.customerRegitrationForm.value;
    this.loading = true;
    const customerAddData = {
      mobile_no: this.customer.mobile_no,
      agent_mobile_no: this.retailerMobileNo,
      customer_name: this.customer.customer_name,
      last_name: "",
      address1: this.customer.address1,
      address2: this.customer.address2,
      pincode: this.customer.pincode,
      email: this.customer.email,
      // state_ref_id: this.customer.state?.state_ref_id,
      // state: this.customer.state?.state,
      // city: this.customer?.state.district,
      // dob: this.customer.dob,
      state_ref_id: this.areaList.length ? this.areaList[0].state_ref_id : "",
      state: this.areaList.length ? this.areaList[0].state : "",
      city: this.areaList.length ? this.areaList[0].district : "",
      gender: this.customer.gender,
      dob: "",
      otp_validation_flag: "0",
      agent_ref_id: this.retailerRefId,
      pin: this.customer?.pincode,
      location_ref_id: this.customer?.state.location_ref_id,
      flag: "0",
      bank_id: null,
      bank_ref_id: null,
      account_type: environment.account_type_ref_id,
    };

    this.dmtService.addCustomer(customerAddData).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          sessionStorage.setItem("atp_c_otp_state", res?.data?.otp_state);
          sessionStorage.setItem("atp_c_is_int", res?.data?.is_internal);
          setTimeout(() => {
            this.addCustomerOtpVerifyModal(res?.data);
          }, 1000);
        } else if (res.response_code === "201") {
          var encrypted = this.EncrDecr.set(
            environment.dataEncrptionCode,
            this.customer.mobile_no
          );
          sessionStorage.setItem("atp_c_m_n", encrypted);
          this.router.navigate(["/money-transfer/customer-list"]);
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  addCustomerOtpVerifyModal(customerResponse: any) {
    const modalRef = this.modalService.open(
      ValidateRegisterCustomerOtpComponent,
      {
        ariaLabelledBy: "modal-basic-title",
        centered: true,
        backdrop: "static",
        keyboard: false,
      }
    );
    modalRef.componentInstance.customerOrRetailerMobileNo = this.customer?.mobile_no;
    modalRef.componentInstance.customerIsInternal =true;
    modalRef.componentInstance.transactionType ="money-transfer";
    modalRef.result.then((result) => {
      if (result) {
        this.loading = false;
        Swal.fire({
          title: "Success!",
          text: "Customer Verified Successfully!",
          icon: "success",
          confirmButtonColor: "#1172b3",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            var encrypted = this.EncrDecr.set(
              environment.dataEncrptionCode,
              this.customer.mobile_no
            );
            sessionStorage.setItem("atp_c_m_n", encrypted);
            this.router.navigate(["/money-transfer/customer-list"]);
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  pinCodeSubmit(value: any) {
    if (value.length === 6) {
      const authCheckParam = {
        pincode: value,
      };
      this.cacheService.getPinCodeApi(authCheckParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
            this.areaList = res.data;
            this.stateList = [this.areaList?.length ? this.areaList[0] : []];
          }
        },
        (err) => {
          if (err.error.response_code === "101") {
          }
        }
      );
    }
  }

  // selectDistrictState(event: any) {
  //   if (event.value) {
  //     this.districtList = [event.value];
  //     this.stateList = [event.value];
  //   }
  // }

  get customer_name() {
    return this.customerRegitrationForm.get("customer_name")!;
  }

  get mobile_no() {
    return this.customerRegitrationForm.get("mobile_no")!;
  }
  // get last_name() {
  //   return this.customerRegitrationForm.get("last_name")!;
  // }
  get email() {
    return this.customerRegitrationForm.get("email")!;
  }
  get address1() {
    return this.customerRegitrationForm.get("address1")!;
  }
  get gender() {
    return this.customerRegitrationForm.get("gender")!;
  }
  get dob() {
    return this.customerRegitrationForm.get("dob")!;
  }
  get pincode() {
    return this.customerRegitrationForm.get("pincode")!;
  }
  get area() {
    return this.customerRegitrationForm.get("area")!;
  }
  get city() {
    return this.customerRegitrationForm.get("city")!;
  }
  get state() {
    return this.customerRegitrationForm.get("state")!;
  }
}
