import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-top-up",
  templateUrl: "./top-up.component.html",
  styleUrls: ["./top-up.component.scss"],
})
export class TopUpComponent implements OnInit {
  topUpData = [];

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit() {}

  close() {
    this.activeModal.close([]);
  }
}
