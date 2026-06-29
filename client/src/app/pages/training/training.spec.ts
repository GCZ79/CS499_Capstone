import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Training } from './training';

describe('Training', () => {
  let component: Training;
  let fixture: ComponentFixture<Training>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Training],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Training);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
