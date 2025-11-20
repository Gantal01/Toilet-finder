import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const token = localStorage.getItem('jwt');

  if(!token){
    router.navigate(['']);
    return false;
  }


  const payload = JSON.parse(atob(token.split('.')[1]));
  const role = payload.role;

  if(role === 'admin'){
    return true;
  }


  router.navigate(['']);
  return false;
};
