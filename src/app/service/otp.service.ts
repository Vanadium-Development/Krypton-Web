import { Injectable } from '@angular/core';
import {TOTP} from "totp-generator";

@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor() { }


  generateOtp(secret: string): {otp: string; expires: number;} {
    try {
      return TOTP.generate(secret)
    } catch (e) {
      return {
        otp: "Error while generating token. Please make sure to insert a valid secret.",
        expires: new Date().getTime()
      }
    }
  }
}
