import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from "@ngrx/store";
import { environment } from "../environments/environment";
import { ActionTypes } from "./pages/store/customer/logout.action";

export interface State {}

export const reducers: ActionReducerMap<State> = {};

export function clearState(reducer) {
  return function (state, action) {

    if (action.type === ActionTypes.LOGOUT) {
      state = undefined;
    }

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? []
  : [];
