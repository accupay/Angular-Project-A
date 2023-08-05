import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddPgLinkTwoComponent } from "./add-pg-link/add-pg-link.component";

const routes: Routes = [
  {
    path: "",
    component: AddPgLinkTwoComponent,
    data: {
      title: "PG Link-2",
      header: "PG Link-2",
      // urls: [{ title: 'Home'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}]
    },
  },

  {
    path: "pg-link-2",
    component: AddPgLinkTwoComponent,
    data: {
      title: "PG Link-2",
      header: "PG Link-2",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PgLinkTwoRoutingModule {}
