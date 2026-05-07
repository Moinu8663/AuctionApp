import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamPanel } from './team-panel';
import { TeamService } from '../../Services/TeamService/team-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockTeamService = { get: vi.fn().mockReturnValue(of([])) };
const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };
const mockSnackBar = { open: vi.fn() };

describe('TeamPanel Component', () => {
  let component: TeamPanel;
  let fixture: ComponentFixture<TeamPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPanel],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TeamService,  useValue: mockTeamService },
        { provide: MatDialog,    useValue: mockDialog },
        { provide: MatSnackBar,  useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load teams on init', () => {
    expect(mockTeamService.get).toHaveBeenCalled();
  });

  it('should populate teams list', () => {
    mockTeamService.get.mockReturnValue(of([{ teamName: 'MI' }]));
    component.loadTeams();
    expect(component.teams.length).toBe(1);
  });

  it('should show snackbar when teams not found', () => {
    mockTeamService.get.mockReturnValue(of('teams not found'));
    component.loadTeams();
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  // it('should open add dialog', () => {
  //   component.openAdd();
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open edit dialog', () => {
  //   component.openEdit({ teamName: 'MI' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open delete dialog', () => {
  //   component.openDelete({ teamName: 'MI' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });
});
