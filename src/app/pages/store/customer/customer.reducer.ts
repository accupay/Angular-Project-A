import { Action, createReducer, on } from "@ngrx/store";
import { Customer } from "./customer.model";
import * as CustomerActions from "./customer.actions";

export const customerFeatureKey = "Customer";

export interface CustomerState {
  customerLookUpData: Customer[];
  customerData: Customer[];
}

export const initialState: CustomerState = {
  customerLookUpData: [],
  customerData: [],
};

export const customerReducer = createReducer(
  initialState,
  on(
    CustomerActions.addCustomersLookUp,
    (state: CustomerState, { customerLookUp }) => ({
      ...state,
      customerLookUpData: [...state.customerLookUpData, customerLookUp],
    })
  )
);
