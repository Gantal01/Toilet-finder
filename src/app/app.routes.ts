import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LoginComponent } from "./login/login.component";
import { LoginSuccessComponent } from "./login/login-success/login-success.component";
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
{path: '', component: MapComponent},
{path: 'login', component: LoginComponent},
{path: 'login-success', component: LoginSuccessComponent},
{path: 'profile', component: ProfileComponent}
];
