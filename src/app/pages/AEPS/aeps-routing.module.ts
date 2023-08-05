import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AepsComponent } from "./aeps/aeps.component";


const routes: Routes = [
  {
    path: "",
    component: AepsComponent,
    data: {
      title: "AEPS",
      header: "AEPS",
    },
  },
  {
    path: "aeps",
    component: AepsComponent,
    data: {
      title: "AEPS",
      header: "AEPS",
    },
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AepsRoutingModule {}
