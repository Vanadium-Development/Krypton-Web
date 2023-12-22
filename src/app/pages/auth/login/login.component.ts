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
import {AuthenticationService, MeService} from "../../../../../generated-sources/openapi";
import {MessageService} from "primeng/api";
import {ErrorUiService} from "../../../service/error-ui.service";
import {CheckboxModule} from "primeng/checkbox";

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
    CheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {

  authService = inject(AuthenticationService)
  meService = inject(MeService)
  errorService = inject(ErrorUiService)
  error: string = ""



  publicKeyHash = signal("")

  form = new FormBuilder()
    .group({
      username: new FormControl('', Validators.required),
      pkFile: new FormControl('', Validators.required),
      pkStorePassword: new FormControl('', Validators.required),
      pkStorePasswordRepeat: new FormControl('', Validators.required),
      storePkUnencrypted: new FormControl(false)
    })

  onFileChange(event: any) {
    const file = event.target.files[0];

    const fileReader = new FileReader()

    fileReader.onload = () => {
      try {
        const privateKey = forge.pki.privateKeyFromPem(fileReader.result as string)

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


  async readPrivateKeyFile() {

    const file = this.form.controls.pkFile
  }

  submit() {



    if(this.form.valid) {
      if(this.publicKeyHash() != "" && this.publicKeyHash() != "invalid") {


      } else {
        this.error = "Please provide a valid private key"
      }
    } else {
      this.error = "Please fill out all fields"
    }


    // // POC "Storing private key securely"
    // const key = (forge.pkcs5.pbkdf2("hello", "abcd", 1000, 32))
    //
    // const cipher = forge.cipher.createCipher("AES-CBC", key)
    // const decipher = forge.cipher.createDecipher("AES-CBC", key)
    //
    // let iv = forge.random.getBytesSync(16);
    // cipher.start({iv: iv})
    // cipher.update(forge.util.createBuffer("TEST"))
    // cipher.finish()
    //
    // const encrypted = forge.util.bytesToHex(iv + cipher.output.getBytes())
    // console.log(encrypted)
    //
    // decipher.start({iv: forge.util.hexToBytes(encrypted).substring(0, 16)})
    // const data = forge.util.hexToBytes(encrypted).substring(16)
    //
    // decipher.update(forge.util.createBuffer(data))
    //
    // decipher.finish
    // console.log(decipher.output.toString())
  }


}


