import { Component, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  ActivatedRoute,
  NavigationEnd,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
} from "@angular/router";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Observable } from "rxjs";
import { filter, map, mergeMap } from "rxjs/operators";
import { ResponseInterface } from "src/app/shared/interface";
import { AuthService } from "src/app/shared/services/auth.service";
import { DataService } from "src/app/shared/services/common-trigger.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { SearchService } from "src/app/shared/services/search.service";
import { UtilityHelper } from "src/app/shared/utility/utilityHelpers";
import { environment } from "src/environments/environment";
import { NavigationService } from "../../../services/navigation.service";
import { DmtService } from "src/app/shared/services/dmt.service";

@Component({
  selector: "app-admin-layout-sidebar-large",
  templateUrl: "./admin-layout-sidebar-large.component.html",
  styleUrls: ["./admin-layout-sidebar-large.component.scss"],
})
export class AdminLayoutSidebarLargeComponent implements OnInit {
  $menuTitle: Observable<string>;
  moduleLoading: boolean;
  @ViewChild(PerfectScrollbarDirective, { static: true })
  perfectScrollbar: PerfectScrollbarDirective;
  walletBalance = "0";
  walletFormat = "";
  headerTitle = "";
  scrollText = "";
  // icon = "";
  constructor(
    public navService: NavigationService,
    public searchService: SearchService,
    private router: Router,
    private EncrDecr: EncrDecrService,
    private auth: AuthService,
    public activatedRoute: ActivatedRoute,
    public title: Title,
    private dataService: DataService,
    private ngxService: NgxUiLoaderService,
    public dmtService: DmtService,
  ) {
    // User to update wallent balance from bene transaction
    this.dataService.checkWalletBalance.subscribe((check) => {
      if (check) {
        this.checkWalletBalance();
      }
    });
    // Using to set tab title and page title dynamically
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .pipe(filter((route) => route.outlet === "primary"))
      .pipe(mergeMap((route) => route.data))
      .subscribe((event) => {
        this.title.setTitle(event["title"]);
        this.headerTitle = event["title"];
      });
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (
        event instanceof RouteConfigLoadStart ||
        event instanceof ResolveStart
      ) {
        this.moduleLoading = true;
      }
      if (event instanceof RouteConfigLoadEnd || event instanceof ResolveEnd) {
        this.moduleLoading = false;
      }
    });

    this.checkWalletBalance();
    this.getScrollMessage();
  }
    getScrollMessage(){
      var encryptedMobileNo = this.EncrDecr.get(
        environment.dataEncrptionCode,
        localStorage.getItem("logged_user_id")
      );
      var mobile_no = encryptedMobileNo;
      const reportParam = {
        MobileNumber: mobile_no,
      };
      this.dmtService.getScrollMessage(reportParam).subscribe(
        (res: ResponseInterface) => {
          if (res.response_code === "200") {
              this.scrollText=res.data?.message;
              //  console.log(res.data?.message);
          }
      });

    }
  checkWalletBalance() {
    var encryptedMobileNo = this.EncrDecr.get(
      environment.dataEncrptionCode,
      localStorage.getItem("logged_user_id")
    );
    var mobile_no = encryptedMobileNo;
    const authCheckParam = {
      mobile_number: mobile_no,
    };
    this.ngxService.start();
    this.auth.checkBalanceApi(authCheckParam).subscribe(
      (res: ResponseInterface) => {
        this.ngxService.stop();
        if (res.response_code === "200") {
          this.walletBalance = UtilityHelper.currenyFormat(
            res?.data?.current_balance || 0
          );
        }
      },
      (err) => {
        this.ngxService.stop();
        this.walletBalance = UtilityHelper.currenyFormat(0);
      }
    );
  }
}
