import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-check-customer",
  templateUrl: "./check-customer.component.html",
  styleUrls: ["./check-customer.component.scss"],
})
export class CheckCustomerComponent implements OnInit {
  customerDetail: any;
  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit() {
    console.log("customerDetail", this.customerDetail);
  }

  close() {
    this.activeModal.close();
  }

  accept() {
    this.activeModal.close(1);
  }
}
