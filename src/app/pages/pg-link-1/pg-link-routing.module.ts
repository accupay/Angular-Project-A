import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AddPgLinkOneComponent } from "./add-pg-link/add-pg-link.component";

const routes: Routes = [
  {
    path: "",
    component: AddPgLinkOneComponent,
    data: {
      title: "PG Link-1",
      header: "PG Link-1",
      // urls: [{ title: 'Home'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}, {title: 'Money Transfer'}]
    },
  },

  {
    path: "pg-link-1",
    component: AddPgLinkOneComponent,
    data: {
      title: "PG Link-1",
      header: "PG Link-1",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PgLinkOneRoutingModule {}
