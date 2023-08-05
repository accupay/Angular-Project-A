import { createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromCustomer from "./customer.reducer";

export const selectCustomerState =
  createFeatureSelector<fromCustomer.CustomerState>(
    fromCustomer.customerFeatureKey
  );

export const selectCustomerLookUpData = createSelector(
  selectCustomerState,
  (state: fromCustomer.CustomerState) => state.customerLookUpData
);
