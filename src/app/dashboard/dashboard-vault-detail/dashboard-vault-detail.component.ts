import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {VaultService} from "../../service/vault.service";
import {VaultResponse} from "../../../../generated-sources/openapi";

@Component({
  selector: 'app-dashboard-vault-detail',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-vault-detail.component.html',
  styleUrl: './dashboard-vault-detail.component.scss'
})
export class DashboardVaultDetailComponent implements OnInit {


  private route = inject(ActivatedRoute)
  private vaultService = inject(VaultService)
  selectedVault: WritableSignal<VaultResponse | undefined> = signal(undefined)
  id = signal("")

  async ngOnInit() {
    this.route.params.subscribe({
      next: params => {
        this.id.set(params["id"])
        this.vaultService.getVault(this.id()).then(v => {
          this.selectedVault.set(v)
        }).catch(e => {
          console.log(e)
        })

      }
    })
  }


}
