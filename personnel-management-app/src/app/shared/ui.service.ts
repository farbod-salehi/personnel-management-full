import { Injectable, signal } from "@angular/core";

import { AuthInfo } from "../models/authInfo.model";

@Injectable({
  providedIn: 'root'
})
export class UIService {

  // readonly modifier only prevents reassignment. It works at compile time, not runtime—so it’s a developer safeguard
  readonly userInfoSignal = signal<AuthInfo | undefined>(undefined);

  UpdateUserInfo(authInfo: AuthInfo | undefined) {
    this.userInfoSignal.set(authInfo);
  }
}
