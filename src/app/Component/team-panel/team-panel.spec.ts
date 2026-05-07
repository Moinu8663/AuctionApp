import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPanel } from './team-panel';

describe('TeamPanel', () => {
  let component: TeamPanel;
  let fixture: ComponentFixture<TeamPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
