import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { baseApiUrl } from "../../providers/api/api";

@Injectable({
  providedIn: "root",
})
export class CommonService extends baseApiUrl {
  //Only for demo purpose
  authenticated = true;

  constructor(http: HttpClient) {
    super(http);
  }

  filetoBase64(file: any, callback): any {
    this.http
      .get(file, {
        responseType: "blob",
      })
      .subscribe((blob) => {
        const reader = new FileReader();
        const binaryString = reader.readAsDataURL(blob);
        reader.onload = (event: any) => {
          callback(event.target.result);
        };
        reader.onerror = (event: any) => {
          callback(event.target.error.code);
        };
      });
  }
}
