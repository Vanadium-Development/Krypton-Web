import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiBlockService {

  constructor() { }

  public privateKeyPasswordBlock = signal(true)
}
