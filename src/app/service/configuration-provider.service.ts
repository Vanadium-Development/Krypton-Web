import { Injectable } from '@angular/core';
import {APIS} from "../../../generated-sources/openapi";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationProviderService {

  constructor() {
    let apis = APIS

    apis.forEach(a => {

    })
  }
}
