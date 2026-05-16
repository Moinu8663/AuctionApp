import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionView } from './auction-view';

describe('AuctionView', () => {
  let component: AuctionView;
  let fixture: ComponentFixture<AuctionView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionView],
    }).compileComponents();

    fixture = TestBed.createComponent(AuctionView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
