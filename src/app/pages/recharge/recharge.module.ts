import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RechargeRoutingModule } from './recharge-routing.module';
import { RechargeComponent } from './recharge/recharge.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator'; 
import { MatTableModule } from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { NumberAcceptModule } from 'src/app/shared/validation-directives/validation.module';
import { MatTableResponsiveModule } from 'src/app/shared/mat-table-response-directive/mat-table-responsive.module';
import { ScrollingModule } from "@angular/cdk/scrolling";


@NgModule({
  declarations: [RechargeComponent],
  imports: [
    CommonModule,
    RechargeRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatRadioModule,
    NgxDatatableModule,
    NgbModule,
    NgxPaginationModule,
    SelectDropDownModule,
    // MatSelectModule,
    NumberAcceptModule,
    ScrollingModule,
    MatTableResponsiveModule,
  ]
})
export class RechargeModule { }
