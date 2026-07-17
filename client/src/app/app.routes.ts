/**
 * app.routes.ts - Application routing configuration
 * Defines all routes with titles, lazy loading, and route guards.
 * Provides navigation structure for the Grazioso Salvare application
 */
import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Training } from './pages/training/training';
import { AnimalForm } from './animal-form/animal-form';
import { Login } from './login/login';
import { AdminComponent } from './components/admin/admin';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'training', component: Training },
  { path: 'animals/new', component: AnimalForm, canActivate: [authGuard] },
  { path: 'animals/edit/:id', component: AnimalForm, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard]}
];
