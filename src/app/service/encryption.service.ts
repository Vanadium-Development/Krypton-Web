import {inject, Injectable} from '@angular/core';
import {KeystoreService} from "./keystore.service";
import forge, {Bytes} from "node-forge";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private keystoreService = inject(KeystoreService)

  constructor() { }

  encrypt(plainData: Bytes): string {
    const keyBytes = forge.util.decode64(this.keystoreService.aesKey()!)
    const ivBytes = forge.random.getBytesSync(16)
    const cipher = forge.cipher.createCipher("AES-CBC", keyBytes)

    cipher.start({iv: ivBytes})
    cipher.update(forge.util.createBuffer(plainData, "utf8"))
    cipher.finish()

    const encryptedData = forge.util.encode64(cipher.output.getBytes())

    return forge.util.encode64(ivBytes) + "::" + encryptedData
  }

  decrypt(base64Encoded: string): string {
    const keyBytes = forge.util.decode64(this.keystoreService.aesKey()!)

    const iv = base64Encoded.split("::")[0]
    const encryptedString = base64Encoded.split("::")[1]


    const decipher = forge.cipher.createDecipher("AES-CBC", keyBytes)

    decipher.start({iv: forge.util.decode64(iv)})
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedString), "raw"))

    decipher.finish()

    return decipher.output.getBytes()
  }

}
