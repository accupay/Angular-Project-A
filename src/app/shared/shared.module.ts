import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { ToastrModule } from "ngx-toastr";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SearchModule } from "./components/search/search.module";
import { SharedComponentsModule } from "./components/shared-components.module";
import { SharedDirectivesModule } from "./directives/shared-directives.module";
import { SharedPipesModule } from "./pipes/shared-pipes.module";
import { NumberAcceptModule } from "./validation-directives/validation.module";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { beneTransactionReceiptComponent } from "../pages/modals/bene-transaction-receipt/bene-transaction-receipt.component";
import { beneficiaryTransactionComponent } from "../pages/modals/bene-transaction/bene-transaction.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ValidateRegisterCustomerOtpComponent } from "../pages/modals/validate-register-customer-otp/validate-register-customer-otp.component";
import { CheckIfscComponent } from "../pages/modals/check-ifsc/check-ifsc.component";
import { DeleteBeneOtpComponent } from "../pages/modals/delete-bene/delete-bene-otp.component";
import { RetailerProfileComponent } from "../pages/modals/retailer-profile/retailer-profile.component";
import { TPinComponent } from "../pages/modals/t-pin/t-pin.component";
import { KycModalComponent } from "../pages/modals/kyc-modal/kyc.component";
import { AddAccountComponent } from "../pages/modals/add-account/add-account.component";
import { TopUpClaimComponent } from "../pages/modals/top-up-claim/top-up-claim.component";
import { MatButtonModule } from "@angular/material/button";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgxPaginationModule } from "ngx-pagination";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableResponsiveModule } from "./mat-table-response-directive/mat-table-responsive.module";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { BillPayComponent } from "../pages/modals/billPay/billPay.component";


@NgModule({
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    SearchModule,
    ToastrModule.forRoot(),
    NgbModule,
    SharedComponentsModule,
    SharedDirectivesModule,
    SharedPipesModule,
    RouterModule,
    NumberAcceptModule,
    SelectDropDownModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    
    NgxMaterialTimepickerModule,
    NgxDatatableModule,
    NgxPaginationModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableResponsiveModule,
  ],
  exports: [
    SelectDropDownModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    beneTransactionReceiptComponent,
    beneficiaryTransactionComponent,
    ValidateRegisterCustomerOtpComponent,
    CheckIfscComponent,
    DeleteBeneOtpComponent,
    RetailerProfileComponent,
    TPinComponent,
    KycModalComponent,
    AddAccountComponent,
    TopUpClaimComponent,
    BillPayComponent,
  ],
})
export class SharedModule {}
