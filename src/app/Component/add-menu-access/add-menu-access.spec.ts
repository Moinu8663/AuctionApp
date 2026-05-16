import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenuAccess } from './add-menu-access';

describe('AddMenuAccess', () => {
  let component: AddMenuAccess;
  let fixture: ComponentFixture<AddMenuAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMenuAccess],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMenuAccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
