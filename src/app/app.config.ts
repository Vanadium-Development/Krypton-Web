import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient} from "@angular/common/http";
import {Configuration} from "../../generated-sources/openapi";
import {MessageService} from "primeng/api";
import {provideAnimations} from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(), {
    provide: Configuration,
    useValue: new Configuration({
      basePath: "/api",
      credentials: {
        token: localStorage.getItem("krypton_token") ?? ""
      }
    })
  }, MessageService, provideAnimations()]
};
