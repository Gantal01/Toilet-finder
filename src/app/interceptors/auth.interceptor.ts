import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');

  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((err) => {
        const isMe = authReq.url.includes('/user/me');

        if (err.status === 401 && isMe) {
          const msg = err?.error.message;

          localStorage.removeItem('jwt');
          router.navigate(['']);

          if (msg === 'USER_DELETED') {
            snackbar.open(
              'Törölt felhasználó. Kérlek vedd fel velünk a kapcsolatot!',
              'Bezár',
              { duration: 3000 },
            );
          } else {
            snackbar.open('Munakmenet lejárt', 'Bezár', { duration: 3000 });
          }
        }
        return throwError(() => err);
      }),
    );
  }

  return next(req);
};
