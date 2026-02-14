import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('INTERCEPTOR RUN', req.method, req.url);

  const token = localStorage.getItem('jwt');

  const router = inject(Router);
  const auth = inject(AuthService);
  const snackbar = inject(MatSnackBar);

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((err) => {

              console.log('HTTP ERR', err.status, authReq.method, authReq.url, err.error);

        const isMe = authReq.url.includes('/user/me');

        if(err.status === 401 && isMe){
        
        

        const msg = err?.error.message;
        

          auth.logout();
          router.navigate(['']);

        if (msg === "USER_DELETED") {
          snackbar.open(
            'Törölt felhasználó. Kérlek vedd fel velünk a kapcsolatot!',
            'Bezár',
            {duration: 3000} 
          );
        }else{
            snackbar.open(
            'Munakmenet lejárt',
            'Bezár',
            {duration: 3000} 
          );
        }
      }
      return throwError(() => err);

      }),
    );
  }

  return next(req);
};
