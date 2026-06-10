import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contectus } from './contectus';

describe('Contectus', () => {
  let component: Contectus;
  let fixture: ComponentFixture<Contectus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contectus],
    }).compileComponents();

    fixture = TestBed.createComponent(Contectus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
