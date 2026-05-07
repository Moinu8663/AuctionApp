import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuctionPanel } from './auction-panel';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockAuctionService = { get: vi.fn().mockReturnValue(of([])) };
const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };

describe('AuctionPanel Component', () => {
  let component: AuctionPanel;
  let fixture: ComponentFixture<AuctionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionPanel],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuctionService, useValue: mockAuctionService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load auctions on init', () => {
    expect(mockAuctionService.get).toHaveBeenCalled();
  });

  it('should populate auctions list', () => {
    mockAuctionService.get.mockReturnValue(of([{ auctionName: 'IPL 2026' }]));
    component.loadAuctions();
    expect(component.auctions.length).toBe(1);
  });

  // it('should open add dialog', () => {
  //   component.openAdd();
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open edit dialog', () => {
  //   component.openEdit({ auctionName: 'IPL' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open delete dialog', () => {
  //   component.openDelete({ auctionName: 'IPL' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  it('should have correct displayedColumns', () => {
    expect(component.displayedColumns).toContain('auctionName');
    expect(component.displayedColumns).toContain('actions');
  });
});
