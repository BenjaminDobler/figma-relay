import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigmaComponentsComponent } from './figma-components.component';

describe('FigmaComponentsComponent', () => {
  let component: FigmaComponentsComponent;
  let fixture: ComponentFixture<FigmaComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FigmaComponentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FigmaComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
