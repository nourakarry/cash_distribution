import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanBarcodePageComponent } from './scan-barcode-page.component';

describe('ScanBarcodePageComponent', () => {
  let component: ScanBarcodePageComponent;
  let fixture: ComponentFixture<ScanBarcodePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScanBarcodePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanBarcodePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
