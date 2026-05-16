import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDashboard } from './team-dashboard';

describe('TeamDashboard', () => {
  let component: TeamDashboard;
  let fixture: ComponentFixture<TeamDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
