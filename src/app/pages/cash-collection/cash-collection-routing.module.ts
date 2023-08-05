import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CashCollectionComponent } from "./cash-collection/cash-collection.component";

const routes: Routes = [
  {
    path: "",
    component: CashCollectionComponent,
    data: {
      title: "Cash Collection",
      header: "Cash Collection",
    },
  },
  {
    path: "cash-collection",
    component: CashCollectionComponent,
    data: {
      title: "Cash Collection",
      header: "Cash Collection",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashCollectionRoutingModule {}
