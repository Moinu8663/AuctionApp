import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionPanel } from './auction-panel';

describe('AuctionPanel', () => {
  let component: AuctionPanel;
  let fixture: ComponentFixture<AuctionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
