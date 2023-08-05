import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { baseApiUrl } from "../../providers/api/api";
import { ResponseInterface } from "../interface/auth.interface";


@Injectable({
  providedIn: "root",
})
export class CacheService extends baseApiUrl {
  //Only for demo purpose
  authenticated = true;

  constructor(http: HttpClient) {
    super(http);
  }

  private URL: string = this.getCacheBaseUrl();

  getPinCodeApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/GetPincodeDetails",
      params
    );
  }
  getPinCodeApiPayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/GetPincodeDetails",
      params
    );
  }
  getBankListApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL +
      "/api/master/GetBanksList?bank_type=" +
      params.bank_type +
      "&active_banks=" +
      params.active_banks,
      ""
    );
  }

  getBankStateListApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/IFSCBankState?BankRefID=" + params.BankRefID,
      ""
    );
  }

  getBankCityListApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL +
      "/api/master/IFSCBankCity?BankRefID=" +
      params.BankRefID +
      "&StateRefID=" +
      params.StateRefID,
      ""
    );
  }

  getBankBranchListApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL +
      "/api/master/IFSCBankBranch?BankRefID=" +
      params.BankRefID +
      "&CityRefID=" +
      params.cityRefID,
      ""
    );
  }

  getBankIfscLookUpApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/IFSCLookup?IFSCCode=" + params.IFSCCode,
      ""
    );
  }

  getDepositBankList(): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/GetDepositBankList",
      ""
    );
  }

  getTopupTypeList(): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/master/GetTopupTypeList",
      ""
    );
  }
}
