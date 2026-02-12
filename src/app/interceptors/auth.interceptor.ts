import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('jwt');

  const router = inject(Router);
  const auth = inject(AuthService);
  const snackbar = inject(MatSnackBar);

  if (token){
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError((err) => {
        if(err.status === 401){
          auth.logout();
          router.navigate(['']);

          snackbar.open("Törölt felhasználó. Kérlek vedd fel velünk a kapcsolatot!", "Bezár")

        }
        return throwError(() => err);
      })
    );
  }
  
  
  return next(req);
};
