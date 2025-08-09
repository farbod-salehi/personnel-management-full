import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { AuthInfo } from "../models/authInfo.model";

Injectable({
  providedIn: 'root'
})
export class UIService {

  private UserInfoSubject = new BehaviorSubject<AuthInfo | null>(null);

  userInfo$ = this.UserInfoSubject.asObservable(); // $ is a naming convention, that means the variable is an observable

  UpdateUserInfo(authInfo: AuthInfo | null) {
    this.UserInfoSubject.next(authInfo);
  }
}
