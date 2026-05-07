import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerPanel } from './player-panel';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockPlayerService = { get: vi.fn().mockReturnValue(of([])) };
const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };

describe('PlayerPanel Component', () => {
  let component: PlayerPanel;
  let fixture: ComponentFixture<PlayerPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerPanel],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: MatDialog,     useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load players on init', () => {
    expect(mockPlayerService.get).toHaveBeenCalled();
  });

  it('should populate players list', () => {
    mockPlayerService.get.mockReturnValue(of([{ playerName: 'Virat' }]));
    component.loadPlayers();
    expect(component.players.length).toBe(1);
  });

  // it('should open add dialog', () => {
  //   component.openAdd();
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open edit dialog', () => {
  //   component.openEdit({ playerName: 'Virat' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open delete dialog', () => {
  //   component.openDelete({ playerName: 'Virat' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('playerName');
    expect(component.displayedColumns).toContain('mobile');
    expect(component.displayedColumns).toContain('email');
    expect(component.displayedColumns).toContain('actions');
  });
});
