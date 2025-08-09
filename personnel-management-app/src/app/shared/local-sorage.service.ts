import { Injectable } from "@angular/core";

import { AuthInfo } from "../models/authInfo.model";



Injectable({
    providedIn:'root'
})
export class LocalStorageService {

  setAuthInfo(authInfo:AuthInfo) {
    localStorage.setItem("PA_authInfo", JSON.stringify(authInfo));
  }

  getAuthInfo() : AuthInfo | null {

    const authInfo = localStorage.getItem("PA_authInfo");

    if(authInfo) {
      const authInfoObj = JSON.parse(authInfo);
      return new AuthInfo(String(authInfoObj.title), String(authInfoObj.token), Number(authInfoObj.role));
    } else {
      return null;
    }
  }

  clearAuthInfo() {
     localStorage.removeItem("PA_authInfo");
  }
}
