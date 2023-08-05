import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './home-routing.module';
import { HomeDefaultComponent } from './home/home-default.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
// import { DashboardV2Component } from './dashboard-v2/dashboard-v2.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { DashboardV3Component } from './dashboard-v3/dashboard-v3.component';
// import { DashboardV4Component } from './dashboard-v4/dashboard-v4.component';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentsModule,
    NgxEchartsModule,
    NgxDatatableModule,
    NgbModule,
    DashboardRoutingModule
  ],
  declarations: [HomeDefaultComponent]
})
export class HomeModule { }
