import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {MeService, User} from "../../../generated-sources/openapi";

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor() { }

  private meService = inject(MeService)

  private _token = signal("")
  public token = this._token.asReadonly()

  private _meUser: WritableSignal<User | undefined> = signal(undefined)
  public meUser = this._meUser.asReadonly()

  private TOKEN_PATH = "krypton_token"

  storeToken(token: string) {
    localStorage.setItem(this.TOKEN_PATH, token)
    console.log("Successfully stored token")
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_PATH)
  }

  updateMeUser(retry: boolean = true) {
    this.meService.getOwnUser().subscribe({
      next: v => {
        this._meUser.set(v)
        console.log("Successfully updated logged-in user.")
      },
      error: e => {
        console.log("Failed to fetch me-user.", retry ? "Retrying..." : "")
        if(retry)
          this.updateMeUser(false)
      }
    })
  }


}
