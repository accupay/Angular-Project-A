import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NavTitleService {
  private userSource$ = new BehaviorSubject<any>({});
  user = this.userSource$.asObservable();

  setTitle(user): void {
    this.userSource$.next(user);
  }
}
