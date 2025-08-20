import { inject, Injectable, signal } from "@angular/core";

import { AuthInfo } from "../models/authInfo.model";
import { LocalStorageService } from "./local-sorage.service";

@Injectable({
  providedIn: 'root'
})
export class UIService {

  storageService = inject(LocalStorageService);

  // readonly modifier only prevents reassignment. It works at compile time, not runtime—so it’s a developer safeguard
  readonly userInfoSignal = signal<AuthInfo | undefined>(this.storageService.getAuthInfo() ?? undefined);

  UpdateUserInfo(authInfo: AuthInfo | undefined) {
    this.userInfoSignal.set(authInfo);
  }
}
