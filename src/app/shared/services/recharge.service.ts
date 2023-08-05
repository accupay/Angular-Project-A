import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { baseApiUrl } from "../../providers/api/api";
import { ResponseInterface } from "../interface/auth.interface";

@Injectable({
  providedIn: "root",
})
export class RechargeService extends baseApiUrl {
  //Only for demo purpose
  authenticated = true;

  constructor(http: HttpClient) {
    super(http);
  }

  private URL: string =  this.getUttlityBaseUrl();

  // getCustomerApi(params: any): Observable<ResponseInterface> {
  //   return this.http.post<ResponseInterface>(
  //     this.URL + "/api/dmt/GetCustomerInfo",
  //     params
  //   );
  // }

  // addViewAccount(params: any, file:File): Observable<ResponseInterface> {
  //   let formData: FormData = new FormData(); 
  //   // formData.append('bank_file_name', params.bank_file_name); 
  //   formData.append('ifsc_code', params.ifsc_code); 
  //   formData.append('bank_ref_id', params.bank_ref_id); 
  //   formData.append('bank_name', params.bank_name); 
  //   formData.append('account_holder_name', params.account_holder_name); 
  //   formData.append('bank_account_number', params.bank_account_number); 
  //   formData.append('agent_mobile', params.agent_mobile); 
  //   formData.append('File', file); 
  //   return this.http.post<ResponseInterface>(
  //     this.URL + "/api/ECOLLECT/AccountAddition", 
  //     formData
  //   );
  // }

  // verifyVpa(params: any): Observable<ResponseInterface> {
  //   return this.http.post<ResponseInterface>(
  //    "http://prodmerchant.accupayd.co" + "/api/upi/Verify_VPA",
  //     params
  //   );
  // }

  // getProfileSupport(params: any): Observable<ResponseInterface> {
  //   return this.http.post<ResponseInterface>(
  //     this.URL + "/api/common/GetSupportInfo?AgentRefID=" + params.AgentRefID,
  //     ""
  //   );
  // }
  
  getOperatorList(param: Number): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/Recharge/GetOperatorList?RechargeType=" + param
    );
  }

  
  getPlanList(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/Recharge/GetPlanList"
    );
  }

  getRechargeType(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/Recharge/GetRechargeType"
    );
  }

  getRechargePayment(param:any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Recharge/RechargePayment",
      param
    );
  }

  getTopupPlanList(param: Number): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/Recharge/GetDataPlanTopupType?RechargeTypeRefID="+ param
    );
  }
  getPlan(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Recharge/GetPlan",
      param
    );
  }
  getRechargeReport(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Recharge/GetRetailerTransactionReportList",
      param
    );
  }

  statusCheck(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Recharge/StatusCheck" ,
       param,
    );
  }
  getBBCatagory(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/BillPay/GetCategoryList"
    );
  }

  getBBTop5Catagory(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(
      this.URL + "/api/BillPay/GetCategoryTop5List"
    );
  }

  getStateMaster(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/BillPay/GetStateMaster",param
    );
  }

  getBillerData(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/BillPay/GetBillerList" ,
       param,
    );
  }

  fetchData(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/BillPay/billFetch" ,
       param,
    );
  }

  billDataPay(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/BillPay/billPay" ,
       param,
    );
  }

  getBillPaymentReport(param: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/BillPay/BillPaymentRetailerReportAPI",
      param
    );
  }
}
