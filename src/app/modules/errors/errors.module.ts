import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorsRoutingModule } from './errors-routing.module';
import { ErrorsComponent } from '../errors/errors.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { ScanBarcodePageComponent } from './scan-barcode-page/scan-barcode-page.component';
import { NgxScannerQrcodeModule, LOAD_WASM } from 'ngx-scanner-qrcode';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
LOAD_WASM().subscribe();
@NgModule({
  declarations: [
    ErrorsComponent,
    Error404Component,
    Error500Component,
    ScanBarcodePageComponent,
  ],
  imports: [
    CommonModule,
    ErrorsRoutingModule,
    NgxScannerQrcodeModule,
    SweetAlert2Module,
  ],
})
export class ErrorsModule {}
