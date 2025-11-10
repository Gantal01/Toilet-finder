import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from "@angular/common/http";
import { NgForOf } from "@angular/common";
import { MatTabGroup, MatTabLabel, MatTab } from "@angular/material/tabs";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [HttpClientModule, NgForOf, MatTabGroup, MatTab],
  providers: [ApiService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit{

toilets: any[]= [];
users: any[] = [];

constructor(private api: ApiService){}

ngOnInit(): void {
    this.api.getToilets().subscribe({
      next: (data) => {
        this.toilets = data;
      },
    error: (err)=> console.error('APi error: ', err)
    });


    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err)=> console.error('APi error: ', err)

    });

}

}
