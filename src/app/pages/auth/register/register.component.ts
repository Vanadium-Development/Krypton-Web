import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {CardModule} from "primeng/card";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {RadioButtonModule} from "primeng/radiobutton";
import {FormsModule} from "@angular/forms";
import {MessageModule} from "primeng/message";
import * as forge from "node-forge"

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
    MessageModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  formState = signal(FormState.INITIAL)

  generationType: "RSA" | "EC" = "RSA"
  generateKeyLoading = false

  privateKeyUrl = signal("")
  publicKeyUrl = signal("")
  publicKey: string = ""


  protected readonly FormState = FormState;

  ngOnInit() {
    this.generationType = "RSA"
  }


  generateKeys() {
    this.generateKeyLoading = true

    if (this.generationType == "RSA") {
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

  }
}

enum FormState {
  INITIAL,
  KEYS_GENERATED
}
