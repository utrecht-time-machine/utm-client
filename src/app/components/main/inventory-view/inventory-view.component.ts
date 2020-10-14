import { Component, OnInit } from '@angular/core';
import { inventoryitem } from './inventory.model';
import { Router } from '@angular/router';

@Component({
  selector: 'utm-inventory-view',
  templateUrl: './inventory-view.component.html',
  styleUrls: ['./inventory-view.component.scss'],
})
export class InventoryViewComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit() {}
  inventoryitems: inventoryitem[] = [
    new inventoryitem(
      'medal',
      'https://www.globalgiving.org/pfil/36946/pict_large.jpg',
      'You beat the basilisk'
    ),
  ];
  Back() {
    this.router.navigate(['']);
  }
}
