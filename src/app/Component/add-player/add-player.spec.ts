import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayer } from './add-player';

import { of } from 'rxjs';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient } from '@angular/common/http';

import { provideHttpClientTesting } from '@angular/common/http/testing';

import { provideRouter } from '@angular/router';

import { AuctionService } from '../../Services/AuctionService/auction-service';

import { TeamService } from '../../Services/TeamService/team-service';

import { PlayerService } from '../../Services/PlayerService/player-service';

const mockAuctionService = {

  get: vi.fn().mockReturnValue(
    of([])
  ),

};

const mockTeamService = {

  get: vi.fn().mockReturnValue(
    of([])
  ),

};

const mockPlayerService = {

  get: vi.fn().mockReturnValue(
    of([])
  ),

  create: vi.fn().mockReturnValue(
    of({})
  ),

  update: vi.fn().mockReturnValue(
    of({})
  ),

  delete: vi.fn().mockReturnValue(
    of({})
  ),

};

describe('AddPlayer', () => {

  let component: AddPlayer;

  let fixture: ComponentFixture<AddPlayer>;

  beforeEach(async () => {

    vi.clearAllMocks();

    await TestBed.configureTestingModule({

      imports: [AddPlayer],

      providers: [

        provideNoopAnimations(),

        provideHttpClient(),

        provideHttpClientTesting(),

        provideRouter([]),

        {
          provide: AuctionService,
          useValue: mockAuctionService
        },

        {
          provide: TeamService,
          useValue: mockTeamService
        },

        {
          provide: PlayerService,
          useValue: mockPlayerService
        },

      ],

    }).compileComponents();

    fixture = TestBed.createComponent(AddPlayer);

    component = fixture.componentInstance;

    fixture.detectChanges();

    await fixture.whenStable();

  });

  afterEach(() => {

    vi.clearAllMocks();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

});