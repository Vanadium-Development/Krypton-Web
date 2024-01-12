import {Component, inject, signal} from '@angular/core';
import {CardModule} from "primeng/card";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ButtonModule} from "primeng/button";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import * as forge from "node-forge"
import {MessageModule} from "primeng/message";
import {MessageService} from "primeng/api";
import {CheckboxModule} from "primeng/checkbox";
import {Router, RouterLink} from "@angular/router";
import {KeystoreService} from "../../../service/keystore.service";
import {AuthenticationService, MeService} from "../../../../../generated-sources/openapi";
import {ToastService} from "../../../service/toast.service";
import {BackendService} from "../../../service/backend.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    CheckboxModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {

  keystoreService = inject(KeystoreService)
  messageService = inject(MessageService)
  authService = inject(AuthenticationService)
  toastService = inject(ToastService)
  backendService = inject(BackendService)
  router = inject(Router)

  error: string = ""

  privateKeyText: string = ""
  privateKey?: forge.pki.rsa.PrivateKey = undefined


  publicKeyHash = signal("")

  form = new FormBuilder()
    .group({
      username: new FormControl('', Validators.required),
      pkFile: new FormControl('', Validators.required),
      pkStorePassword: new FormControl(''),
      pkStorePasswordRepeat: new FormControl(''),
      storePkUnencrypted: new FormControl(false)
    })

  onFileChange(event: any) {
    const file = event.target.files[0];

    const fileReader = new FileReader()

    fileReader.onload = () => {
      try {
        const privateKey = forge.pki.privateKeyFromPem(fileReader.result as string)
        this.privateKeyText = fileReader.result as string
        this.privateKey = privateKey

        const publicKey = forge.pki.publicKeyToPem(forge.pki.setRsaPublicKey(privateKey.n, privateKey.e))

        const sha256 = forge.md.sha256.create()
        sha256.update(publicKey)
        const hash = sha256.digest().toHex()

        this.publicKeyHash.set(hash)
      } catch (e) {
        this.publicKeyHash.set("invalid")
      }
    }

    fileReader.readAsText(file)

  }


  async submit() {
    if(this.form.valid) {
      this.error = ""
      if(this.publicKeyHash() != "" && this.publicKeyHash() != "invalid") {

        if(this.form.controls.pkStorePassword.value && (this.form.controls.pkStorePassword.value != this.form.controls.pkStorePasswordRepeat.value)) {
          this.error = "Passwords do not match. Please ensure that the passwords entered in both fields are identical."
          return
        }

        this.keystoreService.storePrivateKey(this.privateKeyText, this.form.controls.pkStorePassword.value ?? undefined)

        const privateKey = this.keystoreService.retrievePrivateKey(this.form.controls.pkStorePassword.value ?? undefined)

        if(!privateKey) {
          this.messageService.add({severity: "error", summary: "Error", detail: "Key retrieval test was not successful. Please try again."})
          return;
        }



        this.authService.login({username: this.form.controls.username.value!!}).subscribe({
          next: response => {
            try {
              const decryptedToken = privateKey.decrypt(forge.util.decode64(response.token))

              this.backendService.storeToken(decryptedToken)

              this.backendService.updateMeUser()

              this.router.navigate(["/"])
              this.toastService.showSuccessCustom("Login", "Your login was successful. You will be redirected.")
            } catch (e) {
              this.toastService.showErrorCustom("Error", "Private key is invalid!")
              console.log(e)
              return
            }
          },
          error: e => this.toastService.showError(e)
        })





      } else {
        this.error = "Please provide a valid private key"
      }
    } else {
      this.error = "Please fill out all fields"
    }

  }


}


