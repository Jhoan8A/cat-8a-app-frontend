import { Routes } from '@angular/router';
import { BreedsListComponent } from './components/breeds-list/breeds-list.component';
import { BreedSearchComponent } from './components/breed-search/breed-search.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/breeds', pathMatch: 'full' },
  { path: 'breeds', component: BreedsListComponent, canActivate: [authGuard] },
  { path: 'search', component: BreedSearchComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/breeds' }
];
