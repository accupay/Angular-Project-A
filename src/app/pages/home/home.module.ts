import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeDefaultComponent } from "./home/home-default.component";
import { NgxEchartsModule } from "ngx-echarts";
import { SharedComponentsModule } from "src/app/shared/components/shared-components.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { NavTitleService } from "src/app/shared/services/nav-title.service";
import { UserLoopUpService } from "src/app/shared/services/user-detail.service";
import { BankInfoComponent } from "./bankInfo/bankInfo.component";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableResponsiveModule } from "src/app/shared/mat-table-response-directive/mat-table-responsive.module";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { SharedModule } from "src/app/shared/shared.module";
import { MatTableModule } from "@angular/material/table";
import { VerifyVPAComponent } from "./verify-vpa/verify_VPA_component";
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule } from "@angular/material/stepper";
import { MatButtonModule } from "@angular/material/button";
import { MatTabsModule } from "@angular/material/tabs";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

@NgModule({
  imports: [
    CommonModule,
    SharedComponentsModule,
    NgxEchartsModule,
    NgxDatatableModule,
    NgbModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDatatableModule,
    NgbModule,
    MatPaginatorModule,
    MatTableResponsiveModule,
    ScrollingModule,
    SharedModule,
    MatTableModule,

    //for verify Vpa
    MatIconModule,
    MatStepperModule,
    MatButtonModule,
    MatTabsModule,
    SelectDropDownModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  declarations: [HomeDefaultComponent, ChangePasswordComponent, BankInfoComponent, VerifyVPAComponent],
  providers: [NavTitleService, UserLoopUpService],
})
export class HomeModule {}
