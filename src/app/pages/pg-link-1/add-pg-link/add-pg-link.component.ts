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
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { Customer } from "../../store/customer/customer.model";

interface IAddPGLink {
  customer_phone: string;
  transfer_amount: string;
  remarks: string;
}

@Component({
  selector: "app-add-pg-link1",
  templateUrl: "./add-pg-link.component.html",
  encapsulation: ViewEncapsulation.None,
})
export class AddPgLinkOneComponent implements OnInit {
  loading: boolean;
  loadingText = "Proceed";

  pgLinkForm!: FormGroup;
  pgLink: IAddPGLink;

  currentCustomerMobileNumber;
  retailerRefId = "";
  retailerMobileNo = "";
  retailerName = "";
  pgLinkUrl = "";
  constructor(
    private EncrDecr: EncrDecrService,
    private dmtService: DmtService,
    private router: Router
  ) {
    this.pgLink = {} as IAddPGLink;

    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerMobileNo = retailerInfo?.mobile_number;
    this.retailerName = retailerInfo?.retailer_name;
    this.pgLinkUrl = sessionStorage.getItem("pg-payment-url") || "";
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

    this.initPgForm();
  }

  public initPgForm(): void {
    this.pgLinkForm = new FormGroup({
      customer_phone: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      transfer_amount: new FormControl("", [Validators.required]),
      remarks: new FormControl("", [Validators.required]),
    });
  }

  pgLinkRegistration() {
    this.pgLink = this.pgLinkForm.value;
    if (this.pgLinkForm.invalid) {
      for (const control of Object.keys(this.pgLinkForm.controls)) {
        this.pgLinkForm.controls[control].markAsTouched();
      }
      return;
    }
    this.pgLink = this.pgLinkForm.value;
    this.loading = true;
    const customerAddData = {
      customer_phone: this.pgLink.customer_phone,
      transfer_amount: this.pgLink.transfer_amount,
      agent_ref_id: this.retailerRefId,
      account_type_ref_id: environment.account_type_ref_id,
      channel_type_ref_id: "1",
      agent_name: this.retailerName,
      agent_mobile_number: this.retailerMobileNo,
      pg_service_id: 4,
      // remarks: "",
    };

    this.dmtService.addPgLink(customerAddData).subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          sessionStorage.setItem("pg-payment-url", res?.data?.payment_url);
          this.pgLinkUrl = res?.data?.payment_url;
          this.loading = false;
          Swal.fire({
            title: "Success!",
            text: "PG Registered Successfully!",
            icon: "success",
            confirmButtonColor: "#1172b3",
            confirmButtonText: "Ok",
            html:
              "PG Link : <br>" +
              "<a href=" +
              res?.data?.payment_url +
              " style='color:#1172b3'>" +
              res?.data?.payment_url +
              "</a> ",
          }).then((result) => {
            if (result.isConfirmed) {
              this.pgLinkForm.reset();
            }
          });
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  whatsappRedirect(num: any) {
    const message = "Hello"; // Replace with the message you want to send
    const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }

  get customer_phone() {
    return this.pgLinkForm.get("customer_phone")!;
  }

  get transfer_amount() {
    return this.pgLinkForm.get("transfer_amount")!;
  }

  get remarks() {
    return this.pgLinkForm.get("remarks")!;
  }
}
