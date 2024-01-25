import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVaultCreateComponent } from './dashboard-vault-create.component';

describe('DashboardVaultCreateComponent', () => {
  let component: DashboardVaultCreateComponent;
  let fixture: ComponentFixture<DashboardVaultCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVaultCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardVaultCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
