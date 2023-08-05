import { Action, createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromCustomer from "./customer.reducer";

export class ActionTypes {
  static LOGOUT = "[App] logout";
}

export class Logout implements Action {
  readonly type = ActionTypes.LOGOUT;
}
