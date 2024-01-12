import {Component, inject} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {BlockUIModule} from "primeng/blockui";
import {UiBlockService} from "../../service/ui-block.service";
import {CardModule} from "primeng/card";
import {InputGroupModule} from "primeng/inputgroup";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {ChipsModule} from "primeng/chips";
import {ButtonModule} from "primeng/button";

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    BlockUIModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipsModule,
    ButtonModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {

  uiBlockService = inject(UiBlockService)


}
