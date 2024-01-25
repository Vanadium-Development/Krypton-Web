import {Component, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {BlockUIModule} from "primeng/blockui";
import {UiBlockService} from "../../service/ui-block.service";
import {CardModule} from "primeng/card";
import {InputGroupModule} from "primeng/inputgroup";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {ChipsModule} from "primeng/chips";
import {ButtonModule} from "primeng/button";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {KeystoreService} from "../../service/keystore.service";
import {BackendService} from "../../service/backend.service";
import {SidebarComponent} from "../components/sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    BlockUIModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipsModule,
    ButtonModule,
    ReactiveFormsModule,
    SidebarComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent implements OnInit {

  uiBlockService = inject(UiBlockService)
  keystoreService = inject(KeystoreService)
  backendService = inject(BackendService)

  passwordPromptError = signal("")

  form = new FormGroup({
    password: new FormControl('', Validators.required)
  })

  ngOnInit() {
    this.uiBlockService.privateKeyPasswordBlock.set(!this.keystoreService.isPrivateKeyUnlocked())
  }

  async submitPassword() {
    if(this.form.valid) {
      if(this.keystoreService.unlockPrivateKey(this.form.controls.password.value || "")) {
        this.uiBlockService.privateKeyPasswordBlock.set(false)

        await this.backendService.checkTokenAvailability()

        return
      }
      this.passwordPromptError.set("Failed to unlock private key: invalid password!")

    }
  }

}
