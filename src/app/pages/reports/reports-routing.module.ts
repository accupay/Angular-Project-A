import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TransactionReportComponent } from "./transaction-report/transaction-report.component";
import { RefundPaymentTransactionReportComponent } from "./refund-payment-transaction/refund-payment-transaction.component";
import { RetailerPaymentTransactionReportComponent } from "./retailer-payment-transaction/retailer-payment-transaction.component";
import { PayoutTransactionReportComponent } from "./payout-transaction-report/payout-transaction-report.component";
import { PayoutRefundReportComponent } from "./payout-refund-report/payout-refund-report.component";
import {  retailerPGReportComponent } from "./retailer-PG-report/retailer-PG-report.component";
import { NewTransactionReportComponent } from "./new-transaction-report/new-transaction-report.component";
import { retailerTopUpReportComponent } from "./retailer-top-up-report/retailer-top-up-report.component";
import { StatementStatusComponent } from "./statement-status-details/statement-status.component";
import { RechargeReportComponent } from "./recharge-report/recharge-report.component";
import { TopupClaimReportComponent } from "./topup-claim-report/topup-claim-report.component";
import { BillPaymentTransactionReportComponent } from "./bill-payment-transaction/bill-payment-transaction.component";

const routes: Routes = [
  {
    path: "",
    component: TransactionReportComponent,
    data: {
      title: "Account Statement",
      header: "Account Statement",
    },
  },
  {
    path: "transaction-report",
    component: TransactionReportComponent,
    data: {
      title: "Account Statement",
      header: "Account Statement",
    },
  },
  {
    path: "refund-payment-transaction-report",
    component: RefundPaymentTransactionReportComponent,
    data: {
      title: "Refund Payment Transaction Report",
      header: "Refund Payment Transaction Report",
    },
  },
  {
    path: "retailer-payment-transaction-report",
    component: RetailerPaymentTransactionReportComponent,
    data: {
      title: "Retailer Payment Transaction Report",
      header: "Retailer Payment Transaction Report",
    },
  },
  {
    path: "payout-transaction-report",
    component: PayoutTransactionReportComponent,
    data: {
      title: "Payout Transaction Report",
      header: "Payout Transaction Report",
    },
  },
  {
    path: "payout-refund-report",
    component: PayoutRefundReportComponent,
    data: {
      title: "Payout Refund Report",
      header: "Payout Refund Report",
    },
  },
  {
    path: "retailer-PG-report",
    component: retailerPGReportComponent,
    data: {
      title: "Retailer PG report",
      header: "Retailer PG report",
    },
  },
  {
    path: "new-transaction-report",
    component: NewTransactionReportComponent,
    data: {
      title: "Transaction report",
      header: "Transaction report",
    },
  },
  {
    path: "retailer-topup-report",
    component: retailerTopUpReportComponent,
    data: {
      title: "Retailer Top up report",
      header: "Retailer Top up report",
    },
  },
  {
    path: "statement-status-report",
    component: StatementStatusComponent,
    data: {
      title: "Settlement status report",
      header: "Settlement status report",
    },
  },
  {
    path: "status-recharge-report",
    component: RechargeReportComponent,
    data: {
      title: "Recharge status report",
      header: "Recharge status report",
    },
  },
  {
    path: "topup-claim-report",
    component: TopupClaimReportComponent,
    data: {
      title: "Topup Claim report",
      header: "Topup Claim report",
    },
  },
  {
    path: "bill-payment-report",
    component: BillPaymentTransactionReportComponent,
    data: {
      title: "Bill Payment report",
      header: "Bill Payment report",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
