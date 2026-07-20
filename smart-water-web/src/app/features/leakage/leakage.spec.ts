import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Leakage } from './leakage';

describe('Leakage', () => {
  let component: Leakage;
  let fixture: ComponentFixture<Leakage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Leakage],
    }).compileComponents();

    fixture = TestBed.createComponent(Leakage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
