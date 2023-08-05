import {
  Component,
  HostBinding,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

interface IBeneficiaryForm {
  payee_name?: string;
  mobile_no?: string;
  ifsc_code?: string;
  account_number?: string;
  bankType?: any;
  bank_ref_id?: any;
}
@Component({
  selector: "app-travel",
  templateUrl: "./travel.component.html",
  styleUrls: ["./travel.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TravelComponent implements OnInit {

  ngAfterViewInit() {
  }

  ngOnInit() {
  }

}
