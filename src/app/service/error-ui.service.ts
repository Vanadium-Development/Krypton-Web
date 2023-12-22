import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorUiService {

  constructor() { }


  showError(e: any) {
    console.log(e["error"])
  }
}
