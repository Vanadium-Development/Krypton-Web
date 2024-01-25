import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardVaultDetailComponent } from './dashboard-vault-detail.component';

describe('DashboardVaultDetailComponent', () => {
  let component: DashboardVaultDetailComponent;
  let fixture: ComponentFixture<DashboardVaultDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardVaultDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardVaultDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
