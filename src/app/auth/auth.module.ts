import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './login/login';
import { Signup } from './signup/signup';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    title: 'Iniciar Sesión - FinSmart Network'
  },
  {
    path: 'signup',
    component: Signup,
    title: 'Crear Cuenta - FinSmart Network'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Standalone components
    Login,
    Signup
  ],
  exports: [
    RouterModule
  ]
})
export class AuthModule { } 