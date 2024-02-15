import {Component, inject, OnInit} from '@angular/core';
import {SplitButtonModule} from "primeng/splitbutton";
import {MenuItem, MenuItemCommandEvent} from "primeng/api";
import {BackendService} from "../../../service/backend.service";
import {VaultService} from "../../../service/vault.service";
import {Router} from "@angular/router";

@Component({
  selector: 'krypton-sidebar',
  standalone: true,
  imports: [
    SplitButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  backendService = inject(BackendService)
  vaultService = inject(VaultService)
  router = inject(Router)

  ngOnInit() {
    this.vaultService.loadVaults().then()
  }

  profileMenuItems: MenuItem[] = [
    {
      label: "Settings",
    },
    {
      label: "Logout",
      style: {
        backgroundColor: "#fc6156"
      },
      command: async () => {
        await this.logout()
      }
    }
  ]


  async logout() {
    await this.router.navigate(["/login"])
    await this.backendService.logout()
  }
}
