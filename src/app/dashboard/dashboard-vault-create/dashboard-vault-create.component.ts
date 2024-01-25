import {Component, inject} from '@angular/core';
import {PanelModule} from "primeng/panel";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextareaModule} from "primeng/inputtextarea";
import {InputTextModule} from "primeng/inputtext";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {ButtonModule} from "primeng/button";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {VaultService} from "../../service/vault.service";
import {ToastService} from "../../service/toast.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard-vault-create',
  standalone: true,
  imports: [
    PanelModule,
    InputGroupModule,
    InputTextareaModule,
    InputTextModule,
    InputGroupAddonModule,
    ButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard-vault-create.component.html',
  styleUrl: './dashboard-vault-create.component.scss'
})
export class DashboardVaultCreateComponent {

  vaultService = inject(VaultService)
  toastService = inject(ToastService)
  router = inject(Router)

  form = new FormGroup({
    vaultName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required)
  })



  createVaultSubmit() {
    if(this.form.valid) {
      this.vaultService.createVault(this.form.controls.vaultName.value!!, this.form.controls.description.value!!).then(() => {
        this.vaultService.loadVaults().then(() => {

        })

        this.toastService.showSuccessCustom("Success", "Successfully created vault")
        this.router.navigate(["/"])
      })
    }
  }
}
