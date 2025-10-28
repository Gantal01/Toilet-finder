import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

export const routes: Routes = [
{path: '', component: MapComponent},
{path: 'register', component: RegisterComponent},
{path: 'login', component: LoginComponent}
];
