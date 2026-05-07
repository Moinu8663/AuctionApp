import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAuction } from './add-auction';

describe('AddAuction', () => {
  let component: AddAuction;
  let fixture: ComponentFixture<AddAuction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAuction],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAuction);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
