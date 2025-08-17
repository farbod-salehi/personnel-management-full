import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { LocalStorageService } from "./local-sorage.service";
import { routeNamePath } from "../app.routes";

// CanActivateFn is a function-based alternative to the traditional CanActivate class interface. It was introduced to simplify route guards.
export const AuthGuard: CanActivateFn = (route, state) => {
  const storageService = inject(LocalStorageService);
  const router = inject(Router);


  return storageService.getAuthInfo() ? true
                                      : router.parseUrl(routeNamePath.loginForm); // parseUrl() returns a urlTree that represents a redirect path if guard fails
}
