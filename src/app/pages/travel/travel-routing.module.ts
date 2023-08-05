import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TravelComponent } from "./travel/travel.component";

const routes: Routes = [
  {
    path: "",
    component: TravelComponent,
    data: {
      title: "Travel",
      header: "Travel",
    },
  },
  {
    path: "travel",
    component: TravelComponent,
    data: {
      title: "Travel",
      header: "Travel",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelRoutingModule {}
