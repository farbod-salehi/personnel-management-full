import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { LocalStorageService } from "./local-sorage.service";
import { routeNamePath } from "../app.routes";
import { UIService } from "./ui.service";

// CanActivateFn is a function-based alternative to the traditional CanActivate class interface. It was introduced to simplify route guards.
export const AuthGuard: CanActivateFn = (route, state) => {
  const storageService = inject(LocalStorageService);
  const router = inject(Router);
  const uiService = inject(UIService);

  if (storageService.getAuthInfo()) {
    return true;
  } else {

    uiService.UpdateUserInfo(undefined);

    // parseUrl() returns a urlTree that represents a redirect path if guard fails
    return router.parseUrl(routeNamePath.loginForm);
  }

}
