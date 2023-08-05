import { createAction, props } from "@ngrx/store";
import { Customer } from "./customer.model";

export const addCustomersLookUp = createAction(
  "[Customer] Add Customers LookUp",
  (customerLookUp: Customer) => ({ customerLookUp })
);
