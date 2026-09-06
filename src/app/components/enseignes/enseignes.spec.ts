import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Enseignes } from './enseignes';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Enseignes', () => {
  let component: Enseignes;
  let fixture: ComponentFixture<Enseignes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Enseignes],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Enseignes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
