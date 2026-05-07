import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMpin } from './add-mpin';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockProfileService = { addMpin: vi.fn() };
const mockDialogRef = { close: vi.fn() };

describe('AddMpin Component', () => {
  let component: AddMpin;
  let fixture: ComponentFixture<AddMpin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMpin],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProfileService, useValue: mockProfileService },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMpin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.submit();
    expect(mockProfileService.addMpin).not.toHaveBeenCalled();
  });

  it('should call addMpin and close dialog on success', () => {
    mockProfileService.addMpin.mockReturnValue(of({}));
    component.mpinForm.setValue({ email: 'test@test.com', mpin: '1234' });
    component.submit();
    expect(mockProfileService.addMpin).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should set error on failure', () => {
    mockProfileService.addMpin.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
    component.mpinForm.setValue({ email: 'test@test.com', mpin: '1234' });
    component.submit();
    expect(component.error).toBe('Failed');
  });

  it('should validate mpin pattern', () => {
    component.mpinForm.patchValue({ mpin: 'abc' });
    expect(component.mpinForm.get('mpin')!.hasError('pattern')).toBe(true);
  });

  it('should accept valid 4-digit mpin', () => {
    component.mpinForm.patchValue({ mpin: '1234' });
    expect(component.mpinForm.get('mpin')!.valid).toBe(true);
  });
});
