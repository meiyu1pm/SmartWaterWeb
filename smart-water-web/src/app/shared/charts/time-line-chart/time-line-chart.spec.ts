import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLineChart } from './time-line-chart';

describe('TimeLineChart', () => {
  let component: TimeLineChart;
  let fixture: ComponentFixture<TimeLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeLineChart],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeLineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
