import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {VaultService} from "../../service/vault.service";
import {Credential, CredentialField, FieldType, VaultResponse} from "../../../../generated-sources/openapi";
import {AccordionModule} from "primeng/accordion";
import {ButtonModule} from "primeng/button";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {JsonPipe} from "@angular/common";
import {ToastService} from "../../service/toast.service";
import {Clipboard} from "@angular/cdk/clipboard";
import {OtpService} from "../../service/otp.service";
import {DropdownModule} from "primeng/dropdown";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-dashboard-vault-detail',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    FormsModule,
    JsonPipe,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './dashboard-vault-detail.component.html',
  styleUrl: './dashboard-vault-detail.component.scss'
})
export class DashboardVaultDetailComponent implements OnInit {


  private route = inject(ActivatedRoute)
  private vaultService = inject(VaultService)
  private credentialFieldsToggled: WritableSignal<any> = signal({})
  public createCredentialStatus: WritableSignal<CreateCredentialStatus> = signal({})
  private otps: WritableSignal<any> = signal({})
  private toastService = inject(ToastService)
  private clipboard = inject(Clipboard)
  public otpService = inject(OtpService)
  private confirmationService = inject(ConfirmationService)
  protected currentlyEditing = signal("")
  protected currentlyEditingModel: WritableSignal<CredentialField[] | undefined> = signal(undefined)


  selectedVault: WritableSignal<VaultResponse | undefined> = signal(undefined)
  id = signal("")


  addFieldState = signal({
    title: "",
    fieldType: {value: ""},
    value: ""
  })

  createCredentialForm = new FormBuilder().group({
    name: new FormControl('', Validators.required)
  })

  fieldTypes = [
    {
      name: "Password",
      value: "password"
    },
    {
      name: "Username",
      value: "username"
    },
    // {
    //   name: "Secret",
    //   value: "secret"
    // },
    {
      name: "One Time Password",
      value: "otp"
    }
  ]


  async ngOnInit() {
    this.route.params.subscribe({
      next: params => {
        this.id.set(params["id"])
        this.vaultService.getVault(this.id()).then(v => {
          v.credentials = v.credentials.sort((a, b) => a.title.localeCompare(b.title))
          this.selectedVault.set(v)



          console.log(v)

        }).catch(e => {
          console.log(e)
        })

      }
    })



    setInterval(() => {
    }, 1000)

  }

  calculateExpiresSeconds(i: number): number {
    return Math.round((i - new Date().getTime()) / 1000)
  }


  toggleCredentialFields(fieldId: string) {
    this.credentialFieldsToggled.update(old => {
      old[fieldId] = !(old[fieldId] || false)
      return old
    })
    console.log(this.credentialFieldsToggled()[fieldId])
  }

  isCredentialFieldToggled(fieldId: string) {
    return this.credentialFieldsToggled()[fieldId] ?? false
  }

  async copyValue(value: string) {
    this.clipboard.copy(value)
    this.toastService.showSuccessCustom("Clipboard", "Successfully copied value to clipboard.")
  }

  async submitCredentialCreation() {
    if(this.createCredentialForm.valid) {
      await this.vaultService.createCredential(this.createCredentialForm.controls.name.value!!, this.selectedVault()!!.id)
      await this.ngOnInit()
    }
  }

  async setCurrentlyEdited(credential: string, event: any) {
    event.stopPropagation()
    this.currentlyEditing.set(credential)
    if(!credential) {
      this.currentlyEditingModel.set(undefined)
      await this.ngOnInit()
      return
    }
    this.currentlyEditingModel.set(this.selectedVault()?.credentials.filter(c => c.id == credential)[0].body)
  }

  deleteCredentialFieldFromCurrentlyEditingModel(field: string) {
    this.currentlyEditingModel.update(old => {
      return old?.filter(d => d.id != field)
    })
  }

  async saveCurrentCredentialFields(event: any) {
    event.stopPropagation()
    if(!this.currentlyEditingModel()) return

    await this.vaultService.updateCredential(this.currentlyEditing(), this.currentlyEditingModel()!!)

    this.toastService.showSuccessCustom("Success", "Successfully updated credential.")
    await this.setCurrentlyEdited("", event)
  }

  getCredentialFieldCreateStatus(credentialId: string): FieldType | "none" {
    return this.createCredentialStatus()[credentialId] || "none"
  }

  addCredentialField() {
    this.currentlyEditingModel()!!.push({
      title: this.addFieldState().title,
      value: this.addFieldState().value,
      fieldType: this.addFieldState().fieldType.value as FieldType
    })
  }

  async deleteCredential(credentialId: string, credentialName: string, event: Event) {
    event.stopPropagation()
    this.confirmationService.confirm({
      header: "Delete a vault",
      message: `Are you sure, that you want to delete the credential <b> ${credentialName}. </b> This means, that all data will be deleted indefinitely.`,
      accept: async () => {
        await this.vaultService.deleteCredential(credentialId)
        this.toastService.showSuccessCustom("Success", `Successfully deleted credential ${credentialName}.`)
        await this.ngOnInit()
      }
    })
  }

}

type CreateCredentialStatus = {
  [key: string]: FieldType | 'none'
}
