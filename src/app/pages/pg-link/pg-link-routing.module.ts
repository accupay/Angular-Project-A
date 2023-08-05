import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddPgLinkComponent } from "./add-pg-link/add-pg-link.component";

const routes: Routes = [
  {
    path: "",
    component: AddPgLinkComponent,
    data: {
      title: "PG Link",
      header: "PG Link",
      // urls: [{ title: 'Home'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}]
    },
  },

  {
    path: "pg-link",
    component: AddPgLinkComponent,
    data: {
      title: "PG Link",
      header: "PG Link",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PgLinkRoutingModule {}
