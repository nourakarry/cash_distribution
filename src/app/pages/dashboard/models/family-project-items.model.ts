export class FamilyProjectItem {
  family: Family;
  project: Project;
  items: Item[];
}
class Project {
  id: string;
  name: string;
  startDate: string;
}
class Family {
  id: string;
  idCard: string;
  arName: string;
  enName: string;
  familyPhoto?: string;
  address: string;
  location: string;
}
export class Item {
  id: string;
  category: string;
  name: string;
  photo: string;
  quantity: number;
  subCategory: string;
  totalDistributedQuantity: number;
  totalDistributedQuantityWithDate: number;
  totalDistributedQuantityWithMonth: number;
}
