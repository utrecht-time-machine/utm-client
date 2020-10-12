import { Component, OnInit } from '@angular/core';
import { inventoryitem } from './inventory.model';

@Component({
  selector: 'utm-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss'],
})
export class InventoryViewComponent implements OnInit {
  inventoryitems: inventoryitem[] = [
    new inventoryitem('medal', '', 'You beat him'),
  ];
  constructor() {}

  ngOnInit() {}
}
