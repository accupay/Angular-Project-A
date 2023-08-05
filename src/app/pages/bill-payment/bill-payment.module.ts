import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
import { SharedComponentsModule } from "src/app/shared/components/shared-components.module";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { MatSelectModule } from "@angular/material/select";
import { NavTitleService } from "src/app/shared/services/nav-title.service";
import { NumberAcceptModule } from "src/app/shared/validation-directives/validation.module";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from "@angular/material/form-field";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { SharedModule } from "src/app/shared/shared.module";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { BillPaymentRoutingModule } from "./bill-payment-routing.module";
import { BillPaymentComponent } from "./bill-payment/bill-payment.component";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { HttpClientModule } from "@angular/common/http";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { Ng2SearchPipeModule } from 'ng2-search-filter';

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
    BillPaymentRoutingModule,
    MatTableModule,
    MatIconModule,
    SharedModule,
    MatPaginatorModule,
    ScrollingModule,

    
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    Ng2SearchPipeModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatTabsModule
  ],
  exports: [SelectDropDownModule],
  declarations: [
    BillPaymentComponent
  ],
  providers: [
    NavTitleService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { floatLabel: "always" },
    },
  ],
})
export class BillPaymentModule {}
