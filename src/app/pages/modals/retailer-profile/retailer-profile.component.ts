import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { Customer } from "../../store/customer/customer.model";

@Component({
  selector: "app-retailer-profile",
  templateUrl: "./retailer-profile.component.html",
  styleUrls: ["./retailer-profile.component.scss"],
})
export class RetailerProfileComponent implements OnInit {
  retailerLookUp: any;
  profileSupportData: any;
  profileOrSupport: any;

  constructor(
    public activeModal: NgbActiveModal,
    private EncrDecr: EncrDecrService
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerLookUp = retailerInfo;
  }
  ngOnInit() {}

  close() {
    this.activeModal.close([]);
  }
}
