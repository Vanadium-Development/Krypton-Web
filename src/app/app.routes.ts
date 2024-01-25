import {Router, Routes} from '@angular/router';
import {LoginComponent} from "./pages/auth/login/login.component";
import {RegisterComponent} from "./pages/auth/register/register.component";
import {DashboardLayoutComponent} from "./dashboard/dashboard-layout/dashboard-layout.component";
import {inject} from "@angular/core";
import {BackendService} from "./service/backend.service";
import {KeystoreService} from "./service/keystore.service";
import {DashboardHomeComponent} from "./dashboard/dashboard-home/dashboard-home.component";
import {DashboardVaultCreateComponent} from "./dashboard/dashboard-vault-create/dashboard-vault-create.component";
import {DashboardVaultDetailComponent} from "./dashboard/dashboard-vault-detail/dashboard-vault-detail.component";

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
    children: [
      {
        path: "",
        component: DashboardHomeComponent
      },
      {
        path: "vault/create",
        component: DashboardVaultCreateComponent
      },
      {
        path: "vault/:id",
        component: DashboardVaultDetailComponent
      }
    ],
    canActivate: [async () => {
      let backendService = inject(BackendService)
      let router = inject(Router)
      let keystoreService = inject(KeystoreService)

      if(keystoreService.isPrivateKeyUnlocked()) {
        await backendService.checkTokenAvailability()
        return true
      }

      if(!(backendService.getToken() && backendService.getUsername())) {
        router.navigate(["/login"])
        return false
      }
      return true
    }]
  }
];
