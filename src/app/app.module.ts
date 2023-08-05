import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SharedModule } from "./shared/shared.module";
import { InMemoryWebApiModule } from "angular-in-memory-web-api";
import { InMemoryDataService } from "./shared/inmemory-db/inmemory-db.service";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { reducers, clearState } from "./app.reducers";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { ToastrModule } from "ngx-toastr";
import { environment } from "../environments/environment";
import {
  customerFeatureKey,
  customerReducer,
} from "./pages/store/customer/customer.reducer";
import { RequestInterceptor } from "./providers/interceptor/request.interceptor";
import { AuthGaurd } from "./shared/services/auth.gaurd";
import { EncrDecrService } from "./shared/services/encr-decr.service";
import { NumberAcceptModule } from "./shared/validation-directives/validation.module";

import { MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { NgxUiLoaderModule } from "ngx-ui-loader";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    NumberAcceptModule,
    NgxUiLoaderModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      easing: "ease-in",
      positionClass: "toast-top-right",
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
    StoreModule.forRoot(reducers, { metaReducers: [clearState] }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreModule.forFeature(customerFeatureKey, customerReducer),
    InMemoryWebApiModule.forRoot(InMemoryDataService, {
      passThruUnknownUrl: true,
    }),
    AppRoutingModule,
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    AuthGaurd,
    EncrDecrService,
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
