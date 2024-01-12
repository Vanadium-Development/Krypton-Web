import {Injectable, signal, WritableSignal} from '@angular/core';
import * as forge from "node-forge"
@Injectable({
  providedIn: 'root'
})
export class KeystoreService {

  constructor() { }

  private PK_KEY_STORE_PATH = "krypton_pk_store"
  private SALT = "krypton"
  private _privateKey: WritableSignal<forge.pki.rsa.PrivateKey | undefined> = signal(undefined)
  public privateKey = this._privateKey.asReadonly()

  storePrivateKey(privateKey: string, password?: string) {
    if(!password) {
      localStorage.setItem(this.PK_KEY_STORE_PATH, privateKey)
      return
    }

    const key = forge.pkcs5.pbkdf2(password, this.SALT, 1e3, 32)

    const cipher = forge.cipher.createCipher("AES-CBC", key)

    const initialisationVector = forge.random.getBytesSync(16)

    cipher.start({iv: initialisationVector})
    cipher.update(forge.util.createBuffer(privateKey))
    cipher.finish()

    const encrypted = forge.util.bytesToHex(initialisationVector + cipher.output.getBytes())

    localStorage.setItem(this.PK_KEY_STORE_PATH, encrypted)

  }


  retrievePrivateKey(password?: string): forge.pki.rsa.PrivateKey | null {

    try {
      const storedKey = localStorage.getItem(this.PK_KEY_STORE_PATH)

      if(storedKey == null)
        return null

      if(storedKey.includes("-----BEGIN RSA PRIVATE KEY-----")) {
        return forge.pki.privateKeyFromPem(storedKey)
      }

      if(!password)
        return null

      const key = forge.pkcs5.pbkdf2(password, this.SALT, 1e3, 32)
      const decipher = forge.cipher.createDecipher("AES-CBC", key)

      decipher.start({iv: forge.util.hexToBytes(storedKey).substring(0, 16)})
      const data = forge.util.hexToBytes(storedKey).substring(16)

      decipher.update(forge.util.createBuffer(data))

      decipher.finish()

      return forge.pki.privateKeyFromPem(decipher.output.toString())
    } catch (e) {
      console.log(e)
      return null
    }
  }

  isPrivateKeyUnlocked(): boolean {
    const storedKey = localStorage.getItem(this.PK_KEY_STORE_PATH)

    if(storedKey == null)
      return false

    if(storedKey.includes("-----BEGIN RSA PRIVATE KEY-----")) {
      this._privateKey.set(forge.pki.privateKeyFromPem(storedKey))
      return true
    }

    return false
  }

  unlockPrivateKey(password: string): boolean {
    const privateKey = this.retrievePrivateKey(password)

    if(!privateKey) {
      console.error("Failed to unlock private key")
      return false
    }

    this._privateKey.set(privateKey)

    return true
  }
}
