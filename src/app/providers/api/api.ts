import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class baseApiUrl {
  constructor(public http: HttpClient) {}

  protected getAuthBaseUrl(): string {
    return environment.authApiServerAddress;
  }

  protected getDmtBaseUrl(): string {
    return environment.dmtApiServerAddress;
  }

  protected getCacheBaseUrl(): string {
    return environment.cacheApiServerAddress;
  }

  protected getUttlityBaseUrl(): string {
    return environment.rechargeApiServerAddress;
  }
}
