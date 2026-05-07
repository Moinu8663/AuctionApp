import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { TeamService } from '../../Services/TeamService/team-service';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

const mockProfileService  = { CheckMpin: vi.fn() };
const mockAuctionService  = { get: vi.fn() };
const mockTeamService     = { get: vi.fn() };
const mockPlayerService   = { get: vi.fn() };
const mockDialog          = { open: vi.fn().mockReturnValue({ componentInstance: { mpinForm: { patchValue: vi.fn() } } }) };

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    mockProfileService.CheckMpin.mockReturnValue(of([{ status: 1 }]));
    mockAuctionService.get.mockReturnValue(of([]));
    mockTeamService.get.mockReturnValue(of([]));
    mockPlayerService.get.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProfileService,  useValue: mockProfileService },
        { provide: AuctionService,  useValue: mockAuctionService },
        { provide: TeamService,     useValue: mockTeamService },
        { provide: PlayerService,   useValue: mockPlayerService },
        { provide: MatDialog,       useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set username from sessionStorage on init', () => {
    sessionStorage.setItem('username', 'TestUser');
    component.ngOnInit();
    expect(component.username).toBe('TestUser');
    sessionStorage.removeItem('username');
  });

//   it('should open AddMpin dialog when status is 0', async () => {

//   mockProfileService.CheckMpin.mockReturnValue(
//     of([{ status: 0 }])
//   );

//   component.checkMpin();

//   await fixture.whenStable();

//   expect(mockDialog.open).toHaveBeenCalled();
// });

it('should not open dialog when status is 1', async () => {

  mockDialog.open.mockClear();

  mockProfileService.CheckMpin.mockReturnValue(
    of([{ status: 1 }])
  );

  component.checkMpin();

  await fixture.whenStable();

  expect(mockDialog.open).not.toHaveBeenCalled();
});

it('should set stats after loadActivity', async () => {

  mockAuctionService.get.mockReturnValue(
    of([
      {
        auctionName: 'A1',
        createdAt: '01-01-2026 10.00.00 AM',
        createdBy: 'admin'
      }
    ])
  );

  mockTeamService.get.mockReturnValue(
    of([
      {
        teamName: 'T1',
        createdAt: '01-01-2026 09.00.00 AM',
        ownerName: 'owner'
      }
    ])
  );

  mockPlayerService.get.mockReturnValue(
    of([
      {
        playerName: 'P1',
        createdAt: '01-01-2026 08.00.00 AM',
        role: 'Batsman'
      }
    ])
  );

  component.loadActivity();

  await fixture.whenStable();

  expect(component.stats.auctions).toBe(1);
  expect(component.stats.teams).toBe(1);
  expect(component.stats.players).toBe(1);
});

it('should sort recentActivity by date descending', async () => {

  mockAuctionService.get.mockReturnValue(
    of([
      {
        auctionName: 'Old',
        createdAt: '01-01-2025 08.00.00 AM',
        createdBy: 'a'
      }
    ])
  );

  mockTeamService.get.mockReturnValue(
    of([
      {
        teamName: 'New',
        createdAt: '01-01-2026 08.00.00 AM',
        ownerName: 'b'
      }
    ])
  );

  mockPlayerService.get.mockReturnValue(of([]));

  component.loadActivity();

  await fixture.whenStable();

  expect(component.recentActivity[0].label).toBe('New');
});

it('should handle loadActivity error gracefully', async () => {

  mockAuctionService.get.mockReturnValue(
    throwError(() => new Error('fail'))
  );

  mockTeamService.get.mockReturnValue(of([]));

  mockPlayerService.get.mockReturnValue(of([]));

  component.loadActivity();

  await fixture.whenStable();

  expect(component.activityLoading).toBe(false);
});

});
