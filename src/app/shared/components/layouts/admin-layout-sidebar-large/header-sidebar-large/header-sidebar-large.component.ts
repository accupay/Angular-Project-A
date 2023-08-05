import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { RetailerProfileComponent } from "src/app/pages/modals/retailer-profile/retailer-profile.component";
import { TopUpComponent } from "src/app/pages/modals/top-up/top-up.component";
import { Customer } from "src/app/pages/store/customer/customer.model";
import { ResponseInterface } from "src/app/shared/interface";
import { DmtService } from "src/app/shared/services/dmt.service";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";
import { NavigationService } from "../../../../services/navigation.service";
import { SearchService } from "../../../../services/search.service";
import { TopUpClaimComponent } from "src/app/pages/modals/top-up-claim/top-up-claim.component";

@Component({
  selector: "app-header-sidebar-large",
  templateUrl: "./header-sidebar-large.component.html",
  styleUrls: ["./header-sidebar-large.component.scss"],
})
export class HeaderSidebarLargeComponent implements OnInit {
  companyName = "";
  notifications: any[];
  topUpData = [];
  profileSupport = [];
  retailerRefId = "";
  retailerName = "";

  constructor(
    private navService: NavigationService,
    public searchService: SearchService,
    private router: Router,
    private modalService: NgbModal,
    private dmtService: DmtService,
    private EncrDecr: EncrDecrService
  ) {
    const retailerInfo = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;
    this.retailerRefId = retailerInfo?.retailer_ref_id;
    this.retailerName = retailerInfo?.retailer_name;

    this.notifications = [
      {
        icon: "i-Speach-Bubble-6",
        title: "New Transaction",
        badge: "3",
        text: "100Rs",
        time: new Date(),
        status: "primary",
        link: "/chat",
      },
    ];
  }

  ngOnInit() {
    setTimeout(() => {
      this.getProfileSupport();
      this.getTopupInfo();
    }, 1000);
  }

  toggelSidebar() {
    const state = this.navService.sidebarState;
    if (state.childnavOpen && state.sidenavOpen) {
      return (state.childnavOpen = false);
    }
    if (!state.childnavOpen && state.sidenavOpen) {
      return (state.sidenavOpen = false);
    }
    // item has child items
    if (
      !state.sidenavOpen &&
      state.childnavOpen &&
      this.navService.selectedItem.type === "dropDown"
    ) {
      state.sidenavOpen = true;
      setTimeout(() => {
        state.childnavOpen = true;
      }, 50);
    }
    // item has no child items
    if (!state.sidenavOpen && !state.childnavOpen) {
      state.sidenavOpen = true;
    }
  }

  profile(flag: any) {
    // RetailerProfileComponent
    const modalRef = this.modalService.open(RetailerProfileComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    // modalRef.componentInstance.beneDetail = beneData;
    modalRef.componentInstance.profileSupportData = this.profileSupport;
    modalRef.componentInstance.profileOrSupport = flag;
    modalRef.result.then((result) => {
      if (result) {
      } else {
      }
    });
  }

  returnHome() {
    this.router.navigate(["/home"]);
  }

  getTopupInfo() {
    this.dmtService.getTopupInfo().subscribe(
      (res: ResponseInterface) => {
        if (res.response_code === "200") {
          this.topUpData = res?.data;
        }
      },
      (err) => {}
    );
  }

  getProfileSupport() {
    const profileSupport = {
      AgentRefID: this.retailerRefId,
    };
    this.dmtService.getProfileSupport(profileSupport).subscribe(
      (res: ResponseInterface) => {
        console.log("Res", res);
        if (res.response_code === "200") {
          this.profileSupport = res?.data;
        }
      },
      (err) => {}
    );
  }

  topupInfo() {
    const modalRef = this.modalService.open(TopUpComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.topUpData = this.topUpData;
    modalRef.result.then((result) => {
      if (result) {
      } else {
      }
    });
  }

  topupClaimInfo() {
    const modalRef = this.modalService.open(TopUpClaimComponent, {
      ariaLabelledBy: "modal-basic-title",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    modalRef.componentInstance.topUpData = this.topUpData;
    modalRef.result.then((result) => {
      if (result) {
      } else {
      }
    });
  }

  signout() {
    // if (localStorage.getItem('superAdmin') === 'yes') {
    localStorage.removeItem("sid");
    localStorage.removeItem("session_id");
    localStorage.removeItem("token_id");
    localStorage.removeItem("logged_user_id");
    localStorage.removeItem("atp_c_m_n");
    localStorage.removeItem("atp_c_otp_state");
    sessionStorage.removeItem(environment.retailerDatakey);

    // window.open(this.redirectUrl, '_self');
    // } else {
    this.router.navigate(["/sessions"]);
    // }
  }
}
