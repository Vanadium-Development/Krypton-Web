import {inject, Injectable} from '@angular/core';
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: 'root'
})
export class ErrorUiService {

  constructor() { }

  messageService = inject(MessageService)

  showError(e: any) {
    let err = e["error"] as ErrorModel;

    this.messageService.add({severity: "error", summary: "Error", detail: err.message})

  }
}

type ErrorModel = {
  correlationId: string,
  exception: string,
  message: string,
  status: string,
  statusCode: number
}
