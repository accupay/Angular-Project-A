import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BeneficiaryListComponent } from "./beneficiary-list/beneficiary-list.component";
import { CustomerRegistrationComponent } from "./customer-registration/customer-registration.component";
import { SearchCustomerComponent } from "./customer-search/customer-search.component";

const routes: Routes = [
  {
    path: "",
    component: SearchCustomerComponent,
    data: {
      title: "Money Transfer",
      header: "Money Transfer",
      // urls: [{ title: 'Home'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}]
    },
  },
  {
    path: "money-transfer",
    component: SearchCustomerComponent,
    data: {
      title: "Money Transfer",
      header: "Money Transfer",
    },
  },
  {
    path: "customer-registration",
    component: CustomerRegistrationComponent,
    data: {
      title: "Customer Registration",
      header: "Customer Registration",
    },
  },
  {
    path: "customer-list",
    component: BeneficiaryListComponent,
    data: {
      title: "Beneficiary Management",
      header: "Beneficiary Management",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoneyTransferRoutingModule {}
