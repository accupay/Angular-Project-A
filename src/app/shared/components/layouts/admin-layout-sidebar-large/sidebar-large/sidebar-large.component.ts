import {
  Component,
  OnInit,
  HostListener,
  ViewChildren,
  QueryList,
} from "@angular/core";
import {
  NavigationService,
  IMenuItem,
  IChildItem,
} from "../../../../services/navigation.service";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { PerfectScrollbarDirective } from "ngx-perfect-scrollbar";

import { filter, map, mergeMap, switchMap } from "rxjs/operators";
import { Utils } from "../../../../utils";
import { Store, select } from "@ngrx/store";
import { selectCustomerLookUpData } from "src/app/pages/store/customer/customer.selector";
import { Observable } from "rxjs";
import { Customer } from "src/app/pages/store/customer/customer.model";
import { EncrDecrService } from "src/app/shared/services/encr-decr.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-sidebar-large",
  templateUrl: "./sidebar-large.component.html",
  styleUrls: ["./sidebar-large.component.scss"],
})
export class SidebarLargeComponent implements OnInit {
  retailerLookUp: any;
  selectedItem: IMenuItem;
  nav: IMenuItem[];
  @ViewChildren(PerfectScrollbarDirective)
  psContainers: QueryList<PerfectScrollbarDirective>;
  psContainerSecSidebar: PerfectScrollbarDirective;
  showMenu = "Dashboard";
  finalMenu = [];
  activeMenu = "";

  navItems: IMenuItem[];

  serviceMaster: any;
  constructor(
    public router: Router,
    public navService: NavigationService,
    public activatedRoute: ActivatedRoute,
    private store: Store,
    private EncrDecr: EncrDecrService
  ) {
    // this.retailerLookUp$ = this.store.pipe(select(selectCustomerLookUpData));

    this.retailerLookUp = this.EncrDecr.decryptJson(
      sessionStorage.getItem(environment.retailerDatakey)
    ) as Customer;

    setTimeout(() => {
      this.psContainerSecSidebar = this.psContainers.toArray()[1];
    });
  }

  ngOnInit() {
    this.updateSidebar();
    // CLOSE SIDENAV ON ROUTE CHANGE
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((routeChange) => {
        this.closeChildNav();
        if (Utils.isMobile()) {
          this.navService.sidebarState.sidenavOpen = false;
        }
      });

    setTimeout(() => {
      // Fetching menu list fron the service
      this.navService.menuItems$.subscribe((items) => {
        this.navItems = items;
      });
      // Comparing with Lookup service master

      this.serviceMaster = this.retailerLookUp?.service_master;
      if (this.serviceMaster && this.serviceMaster.length > 0) {
        let menuList = [];
        // this.serviceMaster.forEach((service) => {
        //   this.navItems.forEach((nav) => {
        //     if (
        //       nav.service_id == service.service_id &&
        //       service.service_visibility == "2"
        //     ) {
        //       menuList.push(nav);
        //     }
        //   });
        // });
        this.navItems.forEach((nav) => {
          this.serviceMaster.forEach((service) => {
            if (
              nav.service_id == service.service_id &&
              service.service_visibility == "2"
            ) {
              menuList.push(nav);
            }
          });
        });
        this.nav = menuList;
        setTimeout(() => {
          this.setActiveFlag();
        });
      }
    });
  }

  selectItem(item) {
    this.navService.sidebarState.childnavOpen = true;
    this.navService.selectedItem = item;
    this.setActiveMainItem(item);

    // Scroll to top secondary sidebar
    setTimeout(() => {
      this.psContainerSecSidebar.update();
      this.psContainerSecSidebar.scrollToTop(0, 400);
    });
  }
  closeChildNav() {
    this.navService.sidebarState.childnavOpen = false;
    this.setActiveFlag();
  }

  onClickChangeActiveFlag(item) {
    this.setActiveMainItem(item);
  }

  setActiveMainItem(item) {
    this.nav.forEach((i) => {
      i.active = false;
    });
    item.active = true;
    const selectedNavigation: IMenuItem[] = this.nav.filter(
      (word, index, arr) => {
        return word.active == true;
      }
    );
  }

  setActiveFlag() {
    if (window && window.location) {
      const activeRoute = window.location.hash || window.location.pathname;
      this.nav.forEach((item) => {
        item.active = false;
        if (activeRoute.indexOf(item.state) !== -1) {
          this.navService.selectedItem = item;
          item.active = true;
        }
        if (item.sub) {
          item.sub.forEach((subItem) => {
            subItem.active = false;
            if (activeRoute.indexOf(subItem.state) !== -1) {
              this.navService.selectedItem = item;
              item.active = true;
            }
            if (subItem.sub) {
              subItem.sub.forEach((subChildItem) => {
                if (activeRoute.indexOf(subChildItem.state) !== -1) {
                  this.navService.selectedItem = item;
                  item.active = true;
                  subItem.active = true;
                }
              });
            }
          });
        }
      });
      const selectedNavigation: IMenuItem[] = this.nav.filter(
        (word, index, arr) => {
          return word.active == true;
        }
      );
    }
  }

  updateSidebar() {
    if (Utils.isMobile()) {
      this.navService.sidebarState.sidenavOpen = false;
      this.navService.sidebarState.childnavOpen = false;
    } else {
      this.navService.sidebarState.sidenavOpen = true;
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.updateSidebar();
  }
}
