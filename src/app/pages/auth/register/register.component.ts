import {Component, inject, OnInit, signal} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {RadioButtonModule} from "primeng/radiobutton";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageModule} from "primeng/message";
import * as forge from "node-forge"
import {SelectButtonModule} from "primeng/selectbutton";
import {TooltipModule} from "primeng/tooltip";
import {UserService} from "../../../../../generated-sources/openapi";
import {MessageService} from "primeng/api";
import {Router, RouterLink} from "@angular/router";
import {ToastService} from "../../../service/toast.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    RadioButtonModule,
    FormsModule,
    MessageModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  formState = signal(FormState.INITIAL)

  generationTypeOptions = ["RSA", "ED25519"]
  generateKeyLoading = false

  privateKeyUrl = signal("")
  publicKeyUrl = signal("")
  publicKey: string = ""
  error: string = ""


  userService = inject(UserService)
  messageService = inject(MessageService)
  toastService = inject(ToastService)
  router = inject(Router)

  privateKeyDownloaded = signal(false)
  publicKeyDownloaded = signal(false)


  form = new FormBuilder()
    .group({
      username: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      generationType: new FormControl('RSA', Validators.required)
    })


  protected readonly FormState = FormState;

  ngOnInit() {
  }


  generateKeys() {
    this.generateKeyLoading = true

    if (this.form.controls.generationType.value == "RSA") {
      forge.pki.rsa.generateKeyPair({bits: 4096, workers: 2}, (err, keypair) => {
        this.handleKeys(
          forge.pki.privateKeyToPem(keypair.privateKey),
          forge.pki.publicKeyToPem(keypair.publicKey),
        )

        this.generateKeyLoading = false
        this.formState.set(FormState.KEYS_GENERATED)
      })
    } else {
      console.log("Currently not supported")
    }


  }


  openKey(t: 'public' | 'private') {

    if(t == 'public')
      this.publicKeyDownloaded.set(true)
    if(t == 'private')
      this.privateKeyDownloaded.set(true)

    let a = document.createElement("a")
    document.body.appendChild(a)
    a.setAttribute("style", "display: none")
    a.href = t == "public" ? this.publicKeyUrl() : this.privateKeyUrl()
    a.download = t == "public" ? "public.key.pem" : "private.key.pem"
    a.click()

    a.remove()
  }

  handleKeys(privateKey: string, publicKey: string) {
    this.publicKey = publicKey;
    this.privateKeyUrl.set(URL.createObjectURL(new Blob([privateKey], {type: "text/plain"})))
    this.publicKeyUrl.set(URL.createObjectURL(new Blob([publicKey], {type: "text/plain"})))
  }

  submit() {


    if(!this.form.valid) {
      this.error = "Please fill out all fields"
      return
    }

    if(!this.publicKey) {
      this.error = "There was an error retrieving the private key, please try again. If it still fails contact an administrator."
      return
    }

    this.userService.createUser({
      username: this.form.controls.username.value || "",
      firstname: this.form.controls.firstname.value  || "",
      lastname: this.form.controls.lastname.value || "",
      pubKey: this.publicKey
    }).subscribe({
      next: async _ => {
        this.form.reset()
        await this.router.navigate(['/login'])
        this.messageService.add({severity: "success", summary: "Success", detail: "Your registration was successful, you can now log in."})

      },
      error: e => {
        this.toastService.showError(e)
      }
    })


  }
}

enum FormState {
  INITIAL,
  KEYS_GENERATED
}
