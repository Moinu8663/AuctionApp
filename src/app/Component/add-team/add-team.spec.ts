import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTeam } from './add-team';
import { TeamService } from '../../Services/TeamService/team-service';
import { BlobService } from '../../Services/BlobService/blob-service';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

const mockAuctionService = { get: vi.fn().mockReturnValue(of([{ auctionId: 1, auctionName: 'IPL 2026' }])) };
const mockTeamService    = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };
const mockBlobService    = { uploadImage: vi.fn() };
const mockDialogRef      = { close: vi.fn() };

async function createComponent(dialogData: any = null) {
  await TestBed.configureTestingModule({
    imports: [AddTeam],
    providers: [
      provideNoopAnimations(),
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: AuctionService, useValue: mockAuctionService },
      { provide: TeamService,    useValue: mockTeamService },
      { provide: BlobService,    useValue: mockBlobService },
      { provide: MatDialogRef,   useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: dialogData },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(AddTeam);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, component };
}

describe('AddTeam Component', () => {
  afterEach(() => { vi.clearAllMocks(); TestBed.resetTestingModule(); });

  // ===== CREATION =====
  it('should create in add mode', async () => {
    const { component } = await createComponent();
    expect(component).toBeTruthy();
    expect(component.isEdit).toBe(false);
    expect(component.isDelete).toBe(false);
  });

  it('should create in edit mode', async () => {
    const { component } = await createComponent({ mode: 'edit', teamName: 'MI', ownerName: 'Mukesh', purse: 1000000, auctionId: 1 });
    expect(component.isEdit).toBe(true);
  });

  it('should create in delete mode', async () => {
    const { component } = await createComponent({ mode: 'delete', teamName: 'MI', id: 1 });
    expect(component.isDelete).toBe(true);
  });

  // ===== FORM INIT =====
  it('should initialize empty form in add mode', async () => {
    const { component } = await createComponent();
    expect(component.form.value.teamName).toBe('');
    expect(component.form.value.ownerName).toBe('');
  });

  it('should prefill form with dialogData in edit mode', async () => {
    const { component } = await createComponent({ mode: 'edit', teamName: 'MI', ownerName: 'Mukesh', purse: 1000000, auctionId: 1 });
    expect(component.form.value.teamName).toBe('MI');
    expect(component.form.value.ownerName).toBe('Mukesh');
  });

  it('should load auctions on init', async () => {
    await createComponent();
    expect(mockAuctionService.get).toHaveBeenCalledWith({ flag: 'GET' });
  });

  // ===== FORM VALIDATION =====
  it('should be invalid when form is empty', async () => {
    const { component } = await createComponent();
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid with all required fields', async () => {
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    expect(component.form.valid).toBe(true);
  });

  it('should fail validation when teamName is too short', async () => {
    const { component } = await createComponent();
    component.form.patchValue({ teamName: 'A' });
    expect(component.f['teamName'].hasError('minlength')).toBe(true);
  });

  it('should fail validation when ownerName is too short', async () => {
    const { component } = await createComponent();
    component.form.patchValue({ ownerName: 'AB' });
    expect(component.f['ownerName'].hasError('minlength')).toBe(true);
  });

  it('should fail validation when purse is 0', async () => {
    const { component } = await createComponent();
    component.form.patchValue({ purse: 0 });
    expect(component.f['purse'].hasError('min')).toBe(true);
  });

  // ===== SUBMIT - CREATE =====
  it('should not submit when form is invalid', async () => {
    const { component } = await createComponent();
    component.onSubmit();
    expect(mockTeamService.create).not.toHaveBeenCalled();
  });

  it('should call teamService.create on valid submit in add mode', async () => {
    mockTeamService.create.mockReturnValue(of({}));
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    component.onSubmit();
    expect(mockTeamService.create).toHaveBeenCalled();
  });

  it('should close dialog after successful create', async () => {
    mockTeamService.create.mockReturnValue(of({}));
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should set errorMsg on create failure', async () => {
    mockTeamService.create.mockReturnValue(throwError(() => ({ error: { message: 'Team exists' } })));
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    component.onSubmit();
    expect(component.errorMsg).toBe('Team exists');
  });

  // ===== SUBMIT - UPDATE =====
  it('should call teamService.update on valid submit in edit mode', async () => {
    mockTeamService.update.mockReturnValue(of({}));
    const { component } = await createComponent({ mode: 'edit', id: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, auctionId: 1 });
    component.onSubmit();
    expect(mockTeamService.update).toHaveBeenCalled();
  });

  it('should close dialog after successful update', async () => {
    mockTeamService.update.mockReturnValue(of({}));
    const { component } = await createComponent({ mode: 'edit', id: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, auctionId: 1 });
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  // ===== DELETE =====
  it('should call teamService.delete on onDelete', async () => {
    mockTeamService.delete.mockReturnValue(of({}));
    const { component } = await createComponent({ mode: 'delete', id: 1, teamName: 'MI' });
    component.onDelete();
    expect(mockTeamService.delete).toHaveBeenCalledWith({ id: 1 });
  });

  it('should close dialog after successful delete', async () => {
    mockTeamService.delete.mockReturnValue(of({}));
    const { component } = await createComponent({ mode: 'delete', id: 1, teamName: 'MI' });
    component.onDelete();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should set errorMsg on delete failure', async () => {
    mockTeamService.delete.mockReturnValue(throwError(() => ({ error: { message: 'Delete failed' } })));
    const { component } = await createComponent({ mode: 'delete', id: 1, teamName: 'MI' });
    component.onDelete();
    expect(component.errorMsg).toBe('Delete failed');
  });

  // ===== FILE SELECT =====
  it('should set selectedFile on file select', async () => {
    const { component } = await createComponent();
    const file  = new File(['content'], 'logo.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as any;
    component.onFileSelect(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should not set selectedFile when no file selected', async () => {
    const { component } = await createComponent();
    const event = { target: { files: [] } } as any;
    component.onFileSelect(event);
    expect(component.selectedFile).toBeNull();
  });

  // ===== BLOB UPLOAD =====
  it('should upload image and patch logoUrl before saving', async () => {
    mockBlobService.uploadImage.mockReturnValue(of({ url: 'https://blob.com/logo.png' }));
    mockTeamService.create.mockReturnValue(of({}));
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    component.selectedFile = new File(['content'], 'logo.png', { type: 'image/png' });
    component.onSubmit();
    expect(mockBlobService.uploadImage).toHaveBeenCalled();
    expect(component.form.value.logoUrl).toBe('https://blob.com/logo.png');
  });

  it('should set errorMsg on image upload failure', async () => {
    mockBlobService.uploadImage.mockReturnValue(throwError(() => ({ error: { message: 'Upload failed' } })));
    const { component } = await createComponent();
    component.form.setValue({ auctionId: 1, teamName: 'MI', ownerName: 'Mukesh Ambani', purse: 1000000, logoUrl: '' });
    component.selectedFile = new File(['content'], 'logo.png', { type: 'image/png' });
    component.onSubmit();
    expect(component.errorMsg).toBe('Upload failed');
  });
});
