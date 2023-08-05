import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserLoopUpService {
  private userSource$ = new BehaviorSubject<any>({why : "why"});
  user = this.userSource$.asObservable();

  setUser(user): void {
    this.userSource$.next(user);
  }
}
