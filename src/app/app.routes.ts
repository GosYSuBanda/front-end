import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: 'feed', component: null }, // Aquí irá tu componente Feed
  { path: 'login', component: null }, // Aquí irá tu componente Login
  { path: 'profile', component: null }, // Aquí irá tu componente Profile
  { path: '**', redirectTo: '/feed' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }