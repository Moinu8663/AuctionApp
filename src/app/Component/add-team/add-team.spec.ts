import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeam } from './add-team';

import { of } from 'rxjs';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient } from '@angular/common/http';

import { provideHttpClientTesting } from '@angular/common/http/testing';

import { provideRouter } from '@angular/router';

import { AuctionService } from '../../Services/AuctionService/auction-service';

import { TeamService } from '../../Services/TeamService/team-service';

const mockAuctionService = {

  get: vi.fn().mockReturnValue(
    of([])
  ),

};

const mockTeamService = {

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

describe('AddTeam', () => {

  let component: AddTeam;

  let fixture: ComponentFixture<AddTeam>;

  beforeEach(async () => {

    vi.clearAllMocks();

    await TestBed.configureTestingModule({

      imports: [AddTeam],

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

      ],

    }).compileComponents();

    fixture = TestBed.createComponent(AddTeam);

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