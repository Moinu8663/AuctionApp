import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPanel } from './admin-panel';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockProfileService = { get: vi.fn().mockReturnValue(of([])) };
const mockDialog = { open: vi.fn().mockReturnValue({ afterClosed: () => of(false) }) };

describe('AdminPanel Component', () => {
  let component: AdminPanel;
  let fixture: ComponentFixture<AdminPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProfileService, useValue: mockProfileService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load admins on init', () => {
    expect(mockProfileService.get).toHaveBeenCalled();
    expect(component.admins).toEqual([]);
  });

  it('should load admins list', () => {
    mockProfileService.get.mockReturnValue(of([{ name: 'Admin1', email: 'a@a.com' }]));
    component.loadAdmins();
    expect(component.admins.length).toBe(1);
  });

  // it('should open register dialog on openRegister', () => {
  //   component.openRegister();
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open edit dialog on openEdit', () => {
  //   component.openEdit({ name: 'Admin1' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });

  // it('should open delete dialog on openDelete', () => {
  //   component.openDelete({ name: 'Admin1' });
  //   expect(mockDialog.open).toHaveBeenCalled();
  // });
});
