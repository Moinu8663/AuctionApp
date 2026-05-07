import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMpin } from './add-mpin';

describe('AddMpin', () => {
  let component: AddMpin;
  let fixture: ComponentFixture<AddMpin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMpin],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMpin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
