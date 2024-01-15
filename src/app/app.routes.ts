import {Router, Routes} from '@angular/router';
import {LoginComponent} from "./pages/auth/login/login.component";
import {RegisterComponent} from "./pages/auth/register/register.component";
import {DashboardLayoutComponent} from "./dashboard/dashboard-layout/dashboard-layout.component";
import {inject} from "@angular/core";
import {BackendService} from "./service/backend.service";
import {KeystoreService} from "./service/keystore.service";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: RegisterComponent
  },
  {
    path: "",
    component: DashboardLayoutComponent,
    canActivate: [() => {
      let backendService = inject(BackendService)
      let router = inject(Router)
      let keystoreService = inject(KeystoreService)

      if(keystoreService.isPrivateKeyUnlocked()) {
        backendService.checkTokenAvailability()
        return
      }

      if(!(backendService.getToken() && backendService.getUsername())) {
        router.navigate(["/login"])
        return false
      }
      return true
    }]
  }
];
