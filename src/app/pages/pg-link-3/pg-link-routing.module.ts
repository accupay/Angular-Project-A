import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddPgLinkThreeComponent } from "./add-pg-link/add-pg-link.component";

const routes: Routes = [
  {
    path: "",
    component: AddPgLinkThreeComponent,
    data: {
      title: "PG Link-3",
      header: "PG Link-3",
      // urls: [{ title: 'Home'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}]
    },
  },

  {
    path: "pg-link-3",
    component: AddPgLinkThreeComponent,
    data: {
      title: "PG Link-3",
      header: "PG Link-3",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PgLinkThreeRoutingModule {}
