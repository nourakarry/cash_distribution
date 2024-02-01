import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FamiliesService } from './services/families.service';
import { FamilyProjectItem } from './models/family-project-items.model';
import { DistributedItem } from './models/distributed-item.model';
import { SweetAlertOptions } from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  familyId = '';
  projectId = '';
  familyProjectItem: FamilyProjectItem;
  distributedItems: DistributedItem[] = [];
   API_URL = `${environment.apiUrl}/uploads/`;
  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};
  isLoading = false;
  constructor(
    private activeRoute: ActivatedRoute,
    private familiesService: FamiliesService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  ngOnDestroy() {}
  ngOnInit() {
    this.familyId = this.activeRoute.snapshot.params.familyId || null;
    this.projectId = this.activeRoute.snapshot.params.projectId || null;
    this.familiesService
      .getProjectAndFamilyAndItemsInfo(this.familyId, this.projectId)
      .subscribe((data) => {
        this.familyProjectItem = data;
        this.cdr.detectChanges();
      });
  }
  decrease(itemId: string) {
    const foundedItemIndex = this.distributedItems.findIndex(
      (data) => data.itemId === itemId
    );
    if (foundedItemIndex !== -1) {
      if (this.distributedItems[foundedItemIndex].distributedQuantity - 1 < 0) {
        this.distributedItems[foundedItemIndex].distributedQuantity = 0;
        this.distributedItems.splice(foundedItemIndex, 1);
      } else {
        this.distributedItems[foundedItemIndex].distributedQuantity -= 1;
        if (this.distributedItems[foundedItemIndex].distributedQuantity === 0) {
          this.distributedItems.splice(foundedItemIndex, 1);
        }
      }
    }
  }
  increase(itemId: string) {
    const foundedItemIndex = this.distributedItems.findIndex(
      (data) => data.itemId === itemId
    );
    if (foundedItemIndex === -1) {
      if (
        this.getItem(itemId).quantity -
          this.getItem(itemId).totalDistributedQuantity >
        0
      ) {
        const distributedItem: DistributedItem = {
          familyId: this.familyId,
          projectId: this.projectId,
          itemId: itemId,
          date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          distributedQuantity: 1,
          orginalQuqntity: this.getItem(itemId)?.quantity || 0,
          lat: '',
          lng: '',
        };
        this.distributedItems.push(distributedItem);
      }
    } else {
      const remain =
        this.getItem(itemId).quantity -
        this.getItem(itemId).totalDistributedQuantity;
      if (
        this.distributedItems[foundedItemIndex].distributedQuantity + 1 <=
        remain
      ) {
        this.distributedItems[foundedItemIndex].distributedQuantity += 1;
      }
    }
  }
  getItemQuantity(itemId: string) {
    const foundedItemIndex = this.distributedItems.findIndex(
      (data) => data.itemId === itemId
    );
    if (foundedItemIndex !== -1) {
      return this.distributedItems[foundedItemIndex].distributedQuantity;
    } else {
      return 0;
    }
  }
  getItem(itemId: string) {
    let x: any;
    return this.familyProjectItem.items.find((data) => data.id === itemId) || x;
  }
  save() {
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'نجاح',
      text: 'تم حفظ البيانات بنجاح',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: '',
    };
    const completeFn = () => {
      this.isLoading = false;
    };
    this.familiesService
      .addDistributedProjectItems(this.distributedItems)
      .subscribe({
        next: () => {
          this.showAlert(successAlert);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
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
        this.router.navigate(['error/scan-barcode']);
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
}
