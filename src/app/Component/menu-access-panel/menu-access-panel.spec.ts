import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAccessPanel } from './menu-access-panel';

describe('MenuAccessPanel', () => {
  let component: MenuAccessPanel;
  let fixture: ComponentFixture<MenuAccessPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuAccessPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuAccessPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
