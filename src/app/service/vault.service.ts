import {inject, Injectable, OnInit, signal, WritableSignal} from '@angular/core';
import {
  CredentialField,
  CredentialFieldService,
  CredentialService, FieldCreateRequest, FieldType,
  MeService,
  Vault,
  VaultResponse,
  VaultService as BackendVaultService
} from "../../../generated-sources/openapi";
import {EncryptionService} from "./encryption.service";
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root'
})
export class VaultService implements OnInit {

  private backendService = inject(BackendVaultService)
  private meService = inject(MeService)
  private encryptionService = inject(EncryptionService)
  private toastService = inject(ToastService)
  private credentialService = inject(CredentialService)
  private credentialFieldService = inject(CredentialFieldService)

  private _loadedVaults: WritableSignal<Vault[]> = signal([])
  public loadedVaults = this._loadedVaults.asReadonly()

  constructor(
  ) {

  }

  ngOnInit() {

    this.loadVaults()
  }

  loadVaults() {
    console.log("Loading vaults...")
    return new Promise((resolve) => {
      this.meService.getAllVaults().subscribe({
        next: v => {
          console.log("Successfully loaded vaults... decrypting...")

          this._loadedVaults.update(old => v.map(v => {

            for(let oldVault of old) {
              if(oldVault.id == v.id) {
                return {
                  id: v.id,
                  title: oldVault.title,
                  description: oldVault.description
                }
              }
            }

            return {
              id: v.id,
              title: this.encryptionService.decrypt(v.title),
              description: this.encryptionService.decrypt(v.description),
            }


          }))

          console.log("Finished")
          resolve(true)
        }
      })
    })
  }

  createVault(title: string, description: string) {
    return new Promise((resolve, reject) => {
      this.backendService.createVault({
        title: this.encryptionService.encrypt(title),
        description: this.encryptionService.encrypt(description)
      }).subscribe({
        complete: () => {
          resolve(true)
        },
        error: e => {
          reject(e)
          this.toastService.showError(e)
        }
      })
    })
  }

  getVault(id: string): Promise<VaultResponse> {
    return new Promise((resolve, reject) => {

      this.backendService.getVault(id).subscribe({
        next: v => {
          resolve(this.decryptVault(v))
        },
        error: e => {
          this.toastService.showError(e)
          reject(e)
        }
      })
    })
  }

  decryptVault(vault: VaultResponse) {
    vault.title = this.encryptionService.decrypt(vault.title)
    vault.description = this.encryptionService.decrypt(vault.description)

    vault.credentials = vault.credentials.map(credential => {
      return {
        id: credential.id,
        vault: credential.vault,
        title: this.encryptionService.decrypt(credential.title),
        body: credential.body.map(b => {
          return {
            id: b.id,
            title: this.encryptionService.decrypt(b.title),
            value: this.encryptionService.decrypt(b.value),
            fieldType: b.fieldType
          }
        })
      }
    });


    return vault
  }

  async updateCredential(id: string, fields: CredentialField[]) {

    fields = fields.map(f => {
      return {
        id: f.id,
        title: this.encryptionService.encrypt(f.title),
        fieldType: f.fieldType,
        value: this.encryptionService.encrypt(f.value)
      }
    })
    return new Promise((resolve, reject) => {
      this.credentialService.updateCredential({
        id,
        body: fields
      }).subscribe({
        next: () => {resolve(true)},
        error: e => {
          this.toastService.showError(e)
          reject()
        }
      })
    })
  }


  async createCredential(title: string, vault: string) {
    return new Promise((resolve, reject) => {
      this.credentialService.createCredential(vault, {
        title: this.encryptionService.encrypt(title),
        body: []
      }).subscribe({
        next: () => {resolve(true)},
        error: e => {
          this.toastService.showError(e)
          reject()
        }
      })
    })
  }


  async deleteCredential(credentialId: string) {
    return new Promise((resolve, reject) => {
      this.credentialService.deleteCredential(credentialId).subscribe({
        next: () => resolve(true),
        error: e => {
          this.toastService.showError(e)
          reject()
        }
      })
    })
  }

}
