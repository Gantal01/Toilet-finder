import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-login-success',
  standalone: true,
  imports: [],
  templateUrl: './login-success.component.html',
  styleUrl: './login-success.component.scss'
})
export class LoginSuccessComponent implements OnInit{

constructor(private route: ActivatedRoute, private router: Router){}


ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const token = params['token'];
    if(token) {
      localStorage.setItem('jwt', token);
      console.log('JWT token: ', token);


      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Felhasználó adatai:', payload);
        localStorage.setItem('user', JSON.stringify(payload));
      } catch (e) {
        console.error('Hibás JWT formátum');
      }

      this. router.navigate(['/']);
    }
  })
}



}




