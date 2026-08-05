/**
 * map.ts - Map component for visualizing animal locations
 * Standalone Angular component that renders an interactive Leaflet map.
 * Displays animal locations as markers with tooltips and popups.
 * Highlights the selected animal with a red marker.
 */

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

// ============================================
// MARKER ICON CONFIGURATION
// ============================================

/**
 * Default blue marker icon for all animal locations
 * Uses Leaflet's default marker assets
 */
const iconDefault = L.icon({
  iconUrl: 'assets/leaflet/marker-icon.png',
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Red marker icon for the currently selected animal
 * Provides visual distinction on the map
 */
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

  // ============================================
  // INPUT PROPERTIES
  // ============================================

  /**
   * Animals to show as markers - passed in from the dashboard
   * Each animal with valid location data will appear as a marker
   */
  @Input() animals: Animal[] = [];

  /**
   * The currently selected animal marker turns red
   * Highlights the selected animal on the map
   */
  @Input() selectedAnimal: Animal | null = null;

  // ============================================
  // VIEW CHILD
  // ============================================

  /**
   * Reference to the map container div in the template
   * Leaflet map will be rendered in this element
   */
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  // ============================================
  // PRIVATE PROPERTIES
  // ============================================

  /**
   * Leaflet map instance
   * Created after view initialization
   */
  private map!: L.Map;

  /**
   * Array to keep track of current markers on the map
   * Used for clearing and updating markers
   */
  private markers: L.Marker[] = [];

  /**
   * Default center: Austin, TX - same as original dashboard
   * Used as the initial map viewport
   */
  private defaultCenter: L.LatLngExpression = [30.75, -97.48];
  
  /**
   * Default zoom level for the map
   */
  private defaultZoom = 10;

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  /**
   * Lifecycle hook called after the component's view has been initialized
   * Creates the Leaflet map instance and sets up tiles
   * Handles map resize and initial marker rendering
   */
  ngAfterViewInit(): void {
    // Initialize the map after the DOM element exists
    this.map = L.map(this.mapContainer.nativeElement).setView(
      this.defaultCenter,
      this.defaultZoom
    );
    
    // Handle map resize when container changes
    // Small delay ensures the container is fully rendered
    setTimeout(() => this.map.invalidateSize(), 100);

    // Add OpenStreetMap tiles - same tile source as dash_leaflet default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Draw initial markers if animals already loaded
    if (this.animals.length > 0) {
      this.updateMarkers();
    }
  }

  /**
   * Lifecycle hook called when input properties change
   * Re-renders markers whenever animals or selectedAnimal changes
   * @param {SimpleChanges} changes - Object containing changed input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Re-draw markers whenever animals or selectedAnimal changes
    if (this.map) {
      this.updateMarkers();
    }
  }

  /**
   * Lifecycle hook called when the component is destroyed
   * Cleans up the map instance to prevent memory leaks
   */
  ngOnDestroy(): void {
    // Clean up the map when the component is removed
    if (this.map) {
      this.map.remove();
    }
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Updates all markers on the map based on current animals data
   * Removes existing markers, filters valid locations, and adds new markers
   * Highlights selected animal with red marker and centers map on it
   */
  private updateMarkers(): void {
    // Remove all existing markers from the map
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Filter out animals without valid location data
    // Ensures coordinates are within valid ranges
    const validAnimals = this.animals.filter(
      a => a.location_lat && a.location_long &&
      a.location_lat >= -90 && a.location_lat <= 90 &&
      a.location_long >= -180 && a.location_long <= 180
    );

    // If no valid animals, exit early
    if (validAnimals.length === 0) return;

    // Add new markers for each valid animal
    validAnimals.forEach(animal => {
      // Determine if this animal is the selected one
      const isSelected = this.selectedAnimal?._id === animal._id;
      
      // Choose appropriate icon based on selection state
      const icon = isSelected ? iconSelected : iconDefault;
      
      // Create a marker at the animal's location with the appropriate icon
      const marker = L.marker(
        [animal.location_lat, animal.location_long],
        { icon }
      );

      // Tooltip: animal name on hover - mirrors dl.Tooltip
      marker.bindTooltip(animal.name || 'Unknown');

      // Popup: details on click - mirrors dl.Popup
      // Shows name, breed, age, and sex information
      marker.bindPopup(`
        <strong>${animal.name || 'Unknown'}</strong><br>
        Breed: ${animal.breed}<br>
        Age: ${animal.age_upon_outcome || 'Unknown'}<br>
        Sex: ${animal.sex_upon_outcome || 'Unknown'}
      `);
      
      // Add the marker to the map and keep track of it
      marker.addTo(this.map);
      this.markers.push(marker);

      // Center map on selected animal
      // Provides visual focus on the selected animal's location
      if (isSelected) {
        this.map.setView([animal.location_lat, animal.location_long], this.defaultZoom);
      }
    });
  }
}
