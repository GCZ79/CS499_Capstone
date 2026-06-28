import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ElementRef,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';
import { Animal } from '../../services/animal';

const iconDefault = L.icon({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconSelected = L.icon({
  iconUrl: 'assets/leaflet/marker-icon-red.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x-red.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {

  // Animals to show as markers - passed in from the dashboard
  @Input() animals: Animal[] = [];

  // The currently selected animal - its marker turns red
  @Input() selectedAnimal: Animal | null = null;

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map!: L.Map;
  private markers: L.Marker[] = [];

  // Default center: Austin, TX - same as your original dashboard
  private defaultCenter: L.LatLngExpression = [30.75, -97.48];
  private defaultZoom = 10;

  ngAfterViewInit(): void {
    // Initialize the map after the DOM element exists
    this.map = L.map(this.mapContainer.nativeElement).setView(
      this.defaultCenter,
      this.defaultZoom
    );

    // Add OpenStreetMap tiles - same tile source as dash_leaflet default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Draw initial markers if animals already loaded
    if (this.animals.length > 0) {
      this.updateMarkers();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-draw markers whenever animals or selectedAnimal changes
    if (this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    // Clean up the map when the component is removed
    if (this.map) {
      this.map.remove();
    }
  }

  private updateMarkers(): void {
    // Remove all existing markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const validAnimals = this.animals.filter(
      a => a.location_lat && a.location_long
    );

    if (validAnimals.length === 0) return;

    validAnimals.forEach(animal => {
      const isSelected = this.selectedAnimal?._id === animal._id;
      const icon = isSelected ? iconSelected : iconDefault;

      const marker = L.marker(
        [animal.location_lat, animal.location_long],
        { icon }
      );

      // Tooltip: animal name on hover - mirrors dl.Tooltip
      marker.bindTooltip(animal.name || 'Unknown');

      // Popup: details on click - mirrors dl.Popup
      marker.bindPopup(`
        <strong>${animal.name || 'Unknown'}</strong><br>
        Breed: ${animal.breed}<br>
        Age: ${animal.age_upon_outcome || 'Unknown'}<br>
        Sex: ${animal.sex_upon_outcome || 'Unknown'}
      `);

      marker.addTo(this.map);
      this.markers.push(marker);

      // Center map on selected animal
      if (isSelected) {
        this.map.setView([animal.location_lat, animal.location_long], this.defaultZoom);
      }
    });
  }
}
