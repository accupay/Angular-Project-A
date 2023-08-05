import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class EncrDecrService {
  constructor() {}
  //The set method is use for encrypt the value.
  set(keys, value) {
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value.toString()),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  }

  //The get method is use for decrypt the value.
  get(keys, value) {
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var decrypted = CryptoJS.AES.decrypt(value, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptJson(data: any) {
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      environment.dataEncrptionCode
    );
    return ciphertext.toString();
  }

  decryptJson(ciphertext: string): any {
    const bytes = CryptoJS.AES.decrypt(
      ciphertext,
      environment.dataEncrptionCode
    );
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plaintext);
  }
}
