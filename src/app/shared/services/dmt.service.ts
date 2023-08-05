import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { baseApiUrl } from "../../providers/api/api";
import { ResponseInterface } from "../interface/auth.interface";

@Injectable({
  providedIn: "root",
})
export class DmtService extends baseApiUrl {
  //Only for demo purpose
  authenticated = true;

  constructor(http: HttpClient) {
    super(http);
  }

  private URL: string = this.getDmtBaseUrl();

  getCustomerApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/GetCustomerInfo",
      params
    );
  }

  getCustomerFinoApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Fino/GetCustomerInfo",
      params
    );
  }

  getCustomerApiPayOut(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/GetCustomerInfo_payout",
      params
    );
  }

  getBeneficiaryApi(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/GetAllPayee",
      params
    );
  }
  getBeneficiaryApiPayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/GetAllPayee_payout",
      params
    );
  }

  addCustomer(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/RegisterCustomer",
      params
    );
  }
  addCustomerPayOut(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/RegisterCustomer_payout",
      params
    );
  }
  validateCustomerRegistrationOtp(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/ValidateRegisterCustomerOTP",
      params
    );
  }

  validateCustomerRegistrationOtpPayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/ValidateRegisterCustomerOTP_payout",
      params
    );
  }

  resendOtpCRegistration(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/ResendOTP",
      params
    );
  }
  resendOtpCRegistrationPayOut(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/ResendOTP_payout",
      params
    );
  }

  addPayee(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/AddPayee",
      params
    );
  }
  addPayeePayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/AddPayee_payout",
      params
    );
  }

  payeeValidate(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/BeneValidate",
      params
    );
  }

  payeeValidatePayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/BeneValidate_payout",
      params
    );
  }

  moneyTransferTransaction(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/Transaction",
      params
    );
  }

  moneyTransferFinoTransaction(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/Fino/Transaction",
      params
    );
  }

  payoutTransaction(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/FundTransfer",
      params
    );
  }

  transactionReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/TransactionLedgerReport",
      params
    );
  }

  refundPaymenttransactionReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetRefundPaymentTransactionReport",
      params
    );
  }

  retailerPaymentReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetRetailerPaymentTransactionReport",
      params
    );
  }

  getTransactionReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetCommonDetailReport",
      params
    );
  }

  getTopupClaimReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/ClaimTopupReport",
      params
    );
  }

  payoutTransactionReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetRetailerPaymentTransactionReportPayOut",
      params
    );
  }

  payoutRefundReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetRefundPaymentTransactionReportPayout",
      params
    );
  }

  refundOtp(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/Refund",
      params
    );
  }

  deleteBeneOtp(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/SendOTPForPayeeDeletion",
      params
    );
  }
  deleteBeneOtpPayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/SendOTPForPayeeDeletion_payout",
      params
    );
  }

  deleteBene(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/dmt/DeletePayee",
      params
    );
  }

  deleteBenePayout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/DeletePayee_payout",
      params
    );
  }

  getTopupInfo(): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/common/GetTopupInfo",
      ""
    );
  }

  getProfileSupport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/common/GetSupportInfo?AgentRefID=" + params.AgentRefID,
      ""
    );
  }

  addPgLink(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PG/CreateOrder",
      params
    );
  }

  getPgReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetPGReport",
      params
    );
  }
  getRetailerTopUpReport(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetRetailerTopupReport",
      params
    );
  }

  getScrollMessage(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/GetScrollMessage",
      params
    );
  }
  getPin_payout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/GetPin_payout",
      params
    );
  }
  updatePin_payout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/UpdatePin_payout",
      params
    );
  }
  verifyPin_payout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/VerifyPin_payout",
      params
    );
  }

  getStatementReportDetails(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/reports/APTGetCustomerPayoutTxnReport",
      params
    );
  }

  updateCustomerKYC_payout(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/UpdateCustomerKYC_payout",
      params
    );
  }

  fundTransferCustomer(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/PayOut/FundTransferCustomer",
      params
    );
  }

  getViewAccount(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
      this.URL + "/api/ECOLLECT/ViewAccount",
      params
    );
  }

  addViewAccount(params: any, file:File): Observable<ResponseInterface> {
    let formData: FormData = new FormData(); 
    // formData.append('bank_file_name', params.bank_file_name); 
    formData.append('ifsc_code', params.ifsc_code); 
    formData.append('bank_ref_id', params.bank_ref_id); 
    formData.append('bank_name', params.bank_name); 
    formData.append('account_holder_name', params.account_holder_name); 
    formData.append('bank_account_number', params.bank_account_number); 
    formData.append('agent_mobile', params.agent_mobile); 
    formData.append('File', file); 
    return this.http.post<ResponseInterface>(
      this.URL + "/api/ECOLLECT/AccountAddition", 
      formData
    );
  }

  depositSlipUpload(params: any, file:File): Observable<ResponseInterface> {
    let formData: FormData = new FormData(); 
    formData.append("account_ref_id",  params.account_ref_id);
    formData.append("account_type_ref_id", params.account_type_ref_id);
    formData.append("mobile_number", params.mobile_number);
    formData.append("bank_transaction_id", params.bank_transaction_id);
    formData.append("amount", params.amount);
    formData.append("deposited_date",  params.deposited_date);
    formData.append("topup_type_refid", params.topup_type_refid);
    formData.append("deposited_bank", params.deposited_bank);
    formData.append("comments", params.comments);

    formData.append('File', file); 

    return this.http.post<ResponseInterface>(
      this.URL + "/api/ECOLLECT/DepositSlipUpload", 
      formData
    );
  }
  verifyVpa(params: any): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(
     "http://prodmerchant.accupayd.co" + "/api/upi/Verify_VPA",
      params
    );
  }
}
