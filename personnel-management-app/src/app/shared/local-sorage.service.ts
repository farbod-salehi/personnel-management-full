import { Injectable } from "@angular/core";



Injectable({
    providedIn:'root'
})
export class LocalStorageService {

  setAuthInfo(authInfo:{title: string, role: number, token: string}) {
    localStorage.setItem("authInfo", JSON.stringify(authInfo));
  }

  getAuthInfo() : {title: string, role: number, token: string} | null {

    const authInfo = localStorage.getItem("authInfo");

    if(authInfo) {
      const authInfoObj = JSON.parse(authInfo);
      return {
        title: authInfoObj.title,
        role: authInfoObj.role,
        token: authInfoObj.token
      };
    } else {
      return null;
    }
  }

  clearAuthInfo() {
     localStorage.removeItem("authInfo");
  }
}
