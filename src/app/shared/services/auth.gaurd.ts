import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGaurd implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    let currentUserSessionId = localStorage.getItem("sid");
    if (currentUserSessionId && currentUserSessionId != "undefined") {
      if (
        state.url === "/sessions" ||
        state.url === "/sessions/forgot-password" ||
        state.url === "/sessions/signin"
      ) {
        this.router.navigate(["/home"]);
        return false;
      }
      return true;
    } else {
      if (
        state.url === "/sessions" ||
        state.url === "/sessions/forgot-password" ||
        state.url === "/sessions/otp-check"
      ) {
        return true;
      }
    }
    this.router.navigate(["/sessions"]);
    return false;
  }
}
