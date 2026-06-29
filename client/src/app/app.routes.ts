/**
 * app.routes.ts - Application routing configuration
 * Defines all routes with titles, lazy loading, and route guards.
 */
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Training } from './pages/training/training';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'training', component: Training }
];
