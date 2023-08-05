import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BillPaymentComponent } from "./bill-payment/bill-payment.component";

const routes: Routes = [
  {
    path: "",
    component: BillPaymentComponent,
    data: {
      title: "Bill Payment",
      header: "Bill Payment",
    },
  },
  {
    path: "bill-payment",
    component: BillPaymentComponent,
    data: {
      title: "Bill Payment",
      header: "Bill Payment",
    },
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillPaymentRoutingModule {}
