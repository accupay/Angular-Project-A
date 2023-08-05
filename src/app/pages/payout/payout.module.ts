import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
import { SharedComponentsModule } from "src/app/shared/components/shared-components.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { MatSelectModule } from "@angular/material/select";
import { SearchCustomerComponent } from "./customer-search/customer-search.component";
import { PayoutRoutingModule } from "./payout-routing.module";
import { CustomerRegistrationComponent } from "./customer-registration/customer-registration.component";
import { NavTitleService } from "src/app/shared/services/nav-title.service";
import { BeneficiaryListComponent } from "./beneficiary-list/beneficiary-list.component";
import { NumberAcceptModule } from "src/app/shared/validation-directives/validation.module";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MoneyTransferRoutingModule } from "../money-transfer/money-transfer-routing.module";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "src/app/shared/shared.module";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MatTableResponsiveModule } from "src/app/shared/mat-table-response-directive/mat-table-responsive.module";

@NgModule({
  imports: [
    CommonModule,
    SharedComponentsModule,
    SelectDropDownModule,
    NgxEchartsModule,
    NgxDatatableModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDatatableModule,
    MatSelectModule,
    NumberAcceptModule,
    PayoutRoutingModule,
    MoneyTransferRoutingModule,
    MatTableModule,
    MatIconModule,
    SharedModule,
    MatPaginatorModule,
    ScrollingModule,
    MatTableResponsiveModule,

  ],
  exports: [SelectDropDownModule, MatTableResponsiveModule],
  declarations: [
    SearchCustomerComponent,
    CustomerRegistrationComponent,
    BeneficiaryListComponent,
  ],
  providers: [
    NavTitleService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: "always" },
    },
  ],
})
export class PayoutModule {}
