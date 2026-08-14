import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Parent route for the shipments use case — list and detail render in the outlet.
 */
@Component({
  selector: 'app-shipment-usecase-page',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class ShipmentUsecasePage {}
