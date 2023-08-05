import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private userSource$ = new BehaviorSubject<any>(false);
  checkWalletBalance = this.userSource$.asObservable();

  checkWalletBal(checkWalletBalance): void {
    this.userSource$.next(checkWalletBalance);
  }
}
