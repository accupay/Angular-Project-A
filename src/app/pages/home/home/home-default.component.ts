import { ViewEncapsulation } from "@angular/compiler/src/core";
import {
  Component,
  HostBinding,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { NavTitleService } from "src/app/shared/services/nav-title.service";
import { ProductService } from "src/app/shared/services/product.service";
import { UserLoopUpService } from "src/app/shared/services/user-detail.service";
import { environment } from "src/environments/environment";
import { echartStyles } from "../../../shared/echart-styles";

@Component({
  selector: "app-home-default",
  templateUrl: "./home-default.component.html",
  styleUrls: ["./home-default.component.scss"],
})
export class HomeDefaultComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
