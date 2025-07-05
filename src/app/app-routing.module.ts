import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Feed } from './feed/feed';

const routes: Routes = [
  { path: '', component: Feed },
  // ... otras rutas si las hay ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 