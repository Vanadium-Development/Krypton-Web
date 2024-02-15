import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {ToastModule} from "primeng/toast";
import {Get200Response, IndexService} from "../../generated-sources/openapi";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'krypton-client';

  private indexService = inject(IndexService)
  protected response: Get200Response = {}

  ngOnInit() {
    this.indexService.rootGet().subscribe({
      next: v => {
        this.response = v
      }
    })
  }

}
