import { Component, OnInit } from '@angular/core';
import { inventoryitem } from './inventory.model';
import { Router } from '@angular/router';
import inventoryItemsDatabase from '../../../../assets/data-models/InventoryItems/InventoryItems.json';
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
    this.InventoryItems = await this.http
      .get<any>('/assets/data-models/InventoryItems/InventoryItems.json')
      .toPromise();
    console.log(this.InventoryItems);
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
