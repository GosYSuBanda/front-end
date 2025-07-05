import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Feed } from './feed/feed';
import { Signup } from './auth/signup/signup';
import { Login } from './auth/login/login';
import { CommentsPage } from './comments/comments-page/comments-page';

export const routes: Routes = [
  { path: '', component: Feed },
  { path: 'feed', component: Feed },
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'comments/:postId', component: CommentsPage },
  { path: '**', redirectTo: '/feed' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }