import {inject, Injectable} from '@angular/core';
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  private messageService = inject(MessageService)

  showError(e: any) {
    let err = e["error"] as ErrorModel;

    this.messageService.add({severity: "error", summary: "Error", detail: err.message})
  }

  showErrorCustom(title: string, message: string) {
    this.messageService.add({severity: "error", summary: title, detail: message})
  }

  showSuccessCustom(title: string, message: string) {
    this.messageService.add({severity: "success", summary: title, detail: message})
  }
}

type ErrorModel = {
  correlationId: string,
  exception: string,
  message: string,
  status: string,
  statusCode: number
}
