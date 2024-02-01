import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: ':familyId/project/:projectId',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    SweetAlert2Module.forChild(),
  ],
})
export class DashboardModule {}
