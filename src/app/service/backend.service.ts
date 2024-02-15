import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {AuthenticationService, MeService, User} from "../../../generated-sources/openapi";
import {KeystoreService} from "./keystore.service";
import {Router} from "@angular/router";
import forge from "node-forge";
import {firstValueFrom} from "rxjs";
import {Toast} from "primeng/toast";
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor() { }

  private meService = inject(MeService)
  private authService = inject(AuthenticationService)
  private keystoreService = inject(KeystoreService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  private _token = signal("")
  public token = this._token.asReadonly()

  private _meUser: WritableSignal<User | undefined> = signal(undefined)
  public meUser = this._meUser.asReadonly()

  private TOKEN_PATH = "krypton_token"
  private USERNAME_PATH = "krypton_username"

  storeToken(token: string) {
    localStorage.setItem(this.TOKEN_PATH, token)
    console.log("Successfully stored token")
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_PATH)
  }

  storeUsername(username: string) {
    localStorage.setItem(this.USERNAME_PATH, username)
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_PATH)
  }

  async updateAesKey() {
    let aesKey = (await firstValueFrom(this.meService.getAesKey())).aesKey

    this.keystoreService.aesKey.set(this.keystoreService.privateKey()!!.decrypt(forge.util.decode64(aesKey)))
  }

  async checkTokenAvailability() {
    return new Promise((resolve) => {
      console.log("Checking token validity...")

      this.meService.getOwnUser().subscribe({
        complete: async () => {
          console.log("Token validity check successful.")
          this.updateMeUser()
          await this.updateAesKey()
          resolve(true)
        },
        error: _ => {
          if(!this.getUsername()) {
            console.error("Token validity check failed... returning to login")
            this.router.navigate(["/login"])
            resolve(false)
          }
          this.authService.login({username: this.getUsername() || ""}).subscribe({
            next: async v => {
              let pk = this.keystoreService.privateKey()
              if(!pk) {
                console.error("Token validity check failed... returning to login")
                this.router.navigate(["/login"])
                resolve(false)
                return
              }



              try {
                let token = pk.decrypt(forge.util.decode64(v.token))
                console.log("Token validity check failed: successfully refreshed token")
                this.storeToken(token)
                this.updateMeUser()
                await this.updateAesKey()
                resolve(true)
              } catch (e) {
                console.error(e)
                console.error("Token validity check failed: failed to decrypt token, returning to login...")
                this.router.navigate(["/login"])
                resolve(false)

              }


            }
          })
        }
      })
    })
  }

  updateMeUser(retry: boolean = true) {
    this.meService.getOwnUser().subscribe({
      next: v => {
        this._meUser.set(v)
        console.log("Successfully updated logged-in user.")
      },
      error: _ => {
        console.log("Failed to fetch me-user.", retry ? "Retrying..." : "")
        if(retry)
          this.updateMeUser(false)
      }
    })
  }

  async logout() {
    this.meService.logout().subscribe({
      next: () => {
        this.toastService.showSuccessCustom("Success", "Successfully logged out.")
        localStorage.clear()

      },
      error: e => {
        this.toastService.showError(e)
      }
    })
  }


}
