import { Component, OnInit } from '@angular/core';
// import { inventoryitem } from './inventory.model';
import { Router } from '@angular/router';
// import inventoryItemsDatabase from '../../../../assets/data-models/InventoryItems/InventoryItems.json';
import { HttpClient } from '@angular/common/http';

// inventoryItemsDatabase = json.load(assets/data-models/InventoryItems/InventoryItems.json);

@Component({
  selector: 'utm-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss'],
})
export class InventoryViewComponent implements OnInit {
  InventoryItems: any[];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadInventoryItems();
  }

  async loadInventoryItems() {
    let collectedItemsArray = [
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ];
    localStorage.setItem('collectedItems', JSON.stringify(collectedItemsArray));
    let collectedItems = localStorage.getItem('collectedItems');
    let CollectedItemsArray = JSON.parse(collectedItems);
    // console.log(CollectedItemsArray)
    this.InventoryItems = await this.http
      .get<any>('/assets/data-models/InventoryItems/InventoryItems.json')
      .toPromise();
    console.log(this.InventoryItems);
    console.log(typeof this.InventoryItems);
    let ret = [];
    for (let i = 0; i < CollectedItemsArray.length; i++) {
      // console.log(typeof CollectedItemsArray[i])
      console.log(this.InventoryItems);
      if (CollectedItemsArray[i]) {
        ret.push(this.InventoryItems[i]);
        console.log(ret);
      }
    }
    this.InventoryItems = ret;
  }

  // inventoryitems: inventoryitem[] = [
  //   for x in inventoryItemsDatabase
  //   new inventoryitem(
  //     'medal',
  //     'https://www.globalgiving.org/pfil/36946/pict_large.jpg',
  //     'You beat the basilisk'
  //   ),
  // ];
  Back() {
    this.router.navigate(['']);
  }
}
