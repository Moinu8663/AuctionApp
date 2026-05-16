import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamPanel } from './team-panel';
import { TeamService } from '../../Services/TeamService/team-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockTeamService = { get: vi.fn() };
const mockSnackBar    = { open: vi.fn() };

const MOCK_TEAMS = [
  { id: 1, teamName: 'Mumbai Indians',      ownerName: 'Mukesh', purse: 1000000, auctionId: 1 },
  { id: 2, teamName: 'Chennai Super Kings', ownerName: 'CSK',    purse: 2000000, auctionId: 1 },
];

describe('TeamPanel Component', () => {
  let component: TeamPanel;
  let fixture: ComponentFixture<TeamPanel>;
  let dialog: MatDialog;

  beforeEach(async () => {
    mockTeamService.get.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TeamPanel],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TeamService, useValue: mockTeamService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(TeamPanel);
    component = fixture.componentInstance;
    dialog    = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  afterEach(() => { vi.restoreAllMocks(); dialog.closeAll(); });

  // ===== CREATION =====
  it('should create', () => expect(component).toBeTruthy());

  // ===== INIT =====
  it('should call loadTeams on init', () => {
    expect(mockTeamService.get).toHaveBeenCalledWith({ flag: 'GET' });
  });

  it('should set isLoading to false after load', () => {
    expect(component.isLoading).toBe(false);
  });

  // ===== LOAD TEAMS =====
  it('should populate teams list on success', () => {
    mockTeamService.get.mockReturnValue(of(MOCK_TEAMS));
    component.loadTeams();
    expect(component.teams).toEqual(MOCK_TEAMS);
    expect(component.teams.length).toBe(2);
  });

  it('should set teams to empty array when response is empty', () => {
    mockTeamService.get.mockReturnValue(of([]));
    component.loadTeams();
    expect(component.teams).toEqual([]);
  });

  it('should show snackbar when response is "teams not found"', () => {
    mockTeamService.get.mockReturnValue(of('teams not found'));
    component.loadTeams();
    expect(mockSnackBar.open).toHaveBeenCalledWith('teams not found', 'ok', { duration: 2000 });
  });

  it('should not update teams when response is "teams not found"', () => {
    component.teams = MOCK_TEAMS;
    mockTeamService.get.mockReturnValue(of('teams not found'));
    component.loadTeams();
    expect(component.teams).toEqual(MOCK_TEAMS);
  });

  it('should set isLoading to false on error', () => {
    mockTeamService.get.mockReturnValue(throwError(() => new Error('fail')));
    component.loadTeams();
    expect(component.isLoading).toBe(false);
  });

  // ===== DISPLAYED COLUMNS =====
  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('teamName');
    expect(component.displayedColumns).toContain('ownerName');
    expect(component.displayedColumns).toContain('actions');
  });

  // ===== DIALOG - openAdd =====
  it('should open add dialog with null data', () => {
    const spy = vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openAdd();
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: null, width: '460px' }));
  });

  it('should reload teams after add dialog closes with true', () => {
    vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as any);
    const spy = vi.spyOn(component, 'loadTeams');
    component.openAdd();
    expect(spy).toHaveBeenCalled();
  });

  it('should not reload teams after add dialog closes with false', () => {
    vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);
    const spy = vi.spyOn(component, 'loadTeams');
    component.openAdd();
    expect(spy).not.toHaveBeenCalled();
  });

  // ===== DIALOG - openEdit =====
  it('should open edit dialog with team data and mode edit', () => {
    const spy = vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openEdit(MOCK_TEAMS[0]);
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: { ...MOCK_TEAMS[0], mode: 'edit' }, width: '460px' }));
  });

  it('should reload teams after edit dialog closes with true', () => {
    vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as any);
    const spy = vi.spyOn(component, 'loadTeams');
    component.openEdit(MOCK_TEAMS[0]);
    expect(spy).toHaveBeenCalled();
  });

  // ===== DIALOG - openDelete =====
  it('should open delete dialog with team data and mode delete', () => {
    const spy = vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);
    component.openDelete(MOCK_TEAMS[0]);
    expect(spy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: { ...MOCK_TEAMS[0], mode: 'delete' }, width: '380px' }));
  });

  it('should reload teams after delete dialog closes with true', () => {
    vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as any);
    const spy = vi.spyOn(component, 'loadTeams');
    component.openDelete(MOCK_TEAMS[0]);
    expect(spy).toHaveBeenCalled();
  });

  // ===== DESTROY =====
  it('should complete destroy$ on ngOnDestroy', () => {
    const spy = vi.spyOn((component as any).destroy$, 'next');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
