import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  AfterContentInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DrawerComponent,
  MenuComponent,
  ScrollComponent,
  ScrollTopComponent,
  StickyComponent,
  ToggleComponent,
} from '../../../_metronic/kt/components';
import { ThemeModeService } from '../../../_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import {
  ScannerQRCodeConfig,
  ScannerQRCodeSelectedFiles,
  NgxScannerQrcodeService,
  ScannerQRCodeResult,
  NgxScannerQrcodeComponent,
} from 'ngx-scanner-qrcode';
import { FamiliesService } from 'src/app/pages/dashboard/services/families.service';
import {
  NgbModal,
  NgbModalOptions,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { FamilyProjectItem } from 'src/app/pages/dashboard/models/family-project-items.model';
import { DistributedItem } from 'src/app/pages/dashboard/models/distributed-item.model';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-scan-barcode-page',
  templateUrl: './scan-barcode-page.component.html',
  styleUrls: ['./scan-barcode-page.component.scss'],
})
export class ScanBarcodePageComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  private unsubscribe: Subscription[] = [];
  PhotoScanned = false;
  isSubmited = false;
  public config: ScannerQRCodeConfig = {
    //fps: 6600,
    vibrate: 0,
    isBeep: true,
    canvasStyles: [{ width: '500px', height: '300px' }],
    // decode: 'macintosh',
    constraints: {
      audio: true,
      video: {
        width: window.innerWidth,
      },
    },
  };
  devicesList: any = [];
  public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
  public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];
  benificayId = '';
  projectId = '';
  isFrontCamera = true;
  familyProjectItem: FamilyProjectItem;
  @ViewChild('action') action: NgxScannerQrcodeComponent;
  @ViewChild('formModal') formModal: any;
  distributedItems: DistributedItem[] = [];
  private modalRef: NgbModalRef;
  isLoading = false;
  swalOptions: SweetAlertOptions = {
    allowOutsideClick: false,
  };
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
    backdrop: 'static',
    keyboard: false,
  };
  private readonly authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  constructor(
    private router: Router,
    private modeService: ThemeModeService,
    private familiesService: FamiliesService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {}
  ngAfterContentInit(): void {
    setTimeout(() => {
      this.action?.start();
    }, 10000);
  }
  /*ngAfterViewInit(): void {
    setTimeout(() => {
      this.devicesList = this.action.devices.value;
      if (this.devicesList.length > 1) {
        this.action.playDevice(this.devicesList[1]);
      } else {
        this.action.playDevice(this.devicesList[0]);
      }
      this.cdr.detectChanges();
    }, 5000);
  }*/
  ngOnInit(): void {
    const subscr = this.modeService.mode.asObservable().subscribe((mode) => {
      document.body.style.backgroundImage =
        mode === 'dark'
          ? 'url(./assets/media/auth/bg1-dark.jpg)'
          : 'url(./assets/media/auth/bg1.jpg)';
    });
    this.unsubscribe.push(subscr);
  }

  routeToDashboard(familyId: string, projectId: string) {
    this.router.navigate([`familydashboard/${familyId}/project/${projectId}`]);
    setTimeout(() => {
      ToggleComponent.reinitialization();
      ScrollTopComponent.reinitialization();
      DrawerComponent.reinitialization();
      StickyComponent.bootstrap();
      MenuComponent.reinitialization();
      ScrollComponent.reinitialization();
    }, 200);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    document.body.style.backgroundImage = 'none';
  }

  public onEvent(e: ScannerQRCodeResult[]): void {
    if (!this.PhotoScanned && e[0]?.value) {
      if (e[0]?.value.startsWith('projectCode')) {
        let splitBySlash = e[0]?.value.split('/');
        let splitByDots = splitBySlash[0].split(':');
        this.benificayId = splitBySlash[1];
        this.projectId = splitByDots[1];
      } else {
        this.projectId = 'CBPF-TUR-23-S-NGO-26777-65$';
        this.benificayId = e[0]?.value;
      }
      this.PhotoScanned = true;
      this.action.pause();
      const completeFn = () => {
        this.isLoading = false;
      };

      const subscr = this.familiesService
        .getProjectAndFamilyAndItemsInfo(this.benificayId, this.projectId)
        .subscribe({
          next: (data) => {
            this.familyProjectItem = data;
            this.modalRef = this.modalService.open(
              this.formModal,
              this.modalConfig
            );
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.checkErrorStatus(error);
          },
          complete: completeFn,
        });
      this.unsubscribe.push(subscr);
      /*this.familiesService
        .getProjectAndFamilyAndItemsInfo(this.benificayId, this.projectId)
        .subscribe((data) => {

        });*/
    }
  }
  changeCamera() {
    this.devicesList = this.action.devices.value;
    this.isFrontCamera = !this.isFrontCamera;
    if (this.isFrontCamera) {
      this.action.playDevice(this.devicesList[0].deviceId);
    } else {
      this.action.playDevice(this.devicesList[1].deviceId);
    }
    this.cdr.detectChanges();
  }
  save() {
    this.distributedItems = [];
    this.isSubmited = true;
    this.cdr.detectChanges();
    const distributedItem: DistributedItem = {
      familyId: this.benificayId,
      projectId: this.projectId,
      itemId: this.familyProjectItem.items[0].id,
      date: new Date().toISOString(),
      distributedQuantity: 1,
      orginalQuqntity: 5,
      lat: '',
      lng: '',
      date_without_time: (new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')).split(' ')[0],
      time_without_date: (new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ')).split(' ')[1],
    };
    this.distributedItems.push(distributedItem);
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'نجاح',
      text: 'تم حفظ البيانات بنجاح',
    };
    const completeFn = () => {
      this.isLoading = false;
    };
   const subscr = this.familiesService
      .addDistributedProjectItems(this.distributedItems)
      .subscribe({
        next: () => {
          this.showAlert(successAlert);
        },
        error: (error) => {
          this.checkErrorStatus(error);
        },
        complete: completeFn,
      });
    this.unsubscribe.push(subscr);
  }
  close() {
    this.PhotoScanned = false;
    this.action.play();
    this.cdr.detectChanges();
    this.modalRef.close();
  }
  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'تم',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire().then((result) => {
      if (result) {
        this.isSubmited = false;
        this.PhotoScanned = false;
        this.action.play();
        this.cdr.detectChanges();
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
        this.modalRef?.close();
      }
    });
  }
  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
  }
  checkErrorStatus(error: any) {
    if (error.status === 401) {
      localStorage.removeItem(this.authLocalStorageToken);
      this.router.navigate(['/auth/login'], {
        queryParams: {},
      });
    }
    if (error.status === 404) {
      const errorAlert: SweetAlertOptions = {
        icon: 'error',
        title: 'خطأ',
        text: 'هذه العائلة غير موجودة',
      };
      errorAlert.text = this.extractText(error.error);
      this.showAlert(errorAlert);
    }
    if (error.status === 500) {
      const errorAlert: SweetAlertOptions = {
        icon: 'error',
        title: 'خطأ',
        text: 'هذه العائلة غير مرتبطة بالمشروع',
      };
      this.showAlert(errorAlert);
    }

    this.isLoading = false;
  }
}
