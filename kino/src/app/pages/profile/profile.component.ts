import { Component, OnInit } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MovieElementProfileModule } from '../../components/movie-element-profile/movie-element-profile.module';
import { CrudService } from '../../shared/crudService';
import { AuthService } from '../../shared/authService';
import { ProjectionModel } from '../../shared/projectionModel';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  standalone: true,
  imports: [NgbNavModule,CommonModule, MovieElementProfileModule],
})
export class ProfileComponent implements OnInit{
  active = 1;
  userId: string;
  username: string;
  role: string;

  futureReservations: { projection: ProjectionModel, numberOfSeats: number }[] = [];
  pastReservations: { projection: ProjectionModel, numberOfSeats: number }[] = [];
  likes: ProjectionModel[] = [];

  constructor(
    private router: Router, 
    private sanitizer: DomSanitizer, 
    private crudService: CrudService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void 
  {
    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.username = response.user.username;
        this.role = response.user.role;
        this.loadFutureReservations(this.userId);
        this.loadPastReservations(this.userId);
        this.loadLikedProjections(this.userId);
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  loadFutureReservations(userId: string): void 
  {
    this.crudService.getUserFutureReservations(userId).subscribe(
      (response) => {
        this.futureReservations = response.futureReservations;
      },
      (error) => {
        console.error('Error fetching future reservations:', error);
      }
    );
  }

  loadPastReservations(userId: string): void 
  {
    this.crudService.getUserPastReservations(userId).subscribe(
      (response) => {
        this.pastReservations = response.pastReservations;
      },
      (error) => {
        console.error('Error fetching future reservations:', error);
      }
    );
  }

  loadLikedProjections(userId: string): void 
  {
    this.crudService.getLikes(userId).subscribe(
      (response) => {
        this.likes = response.projections;
        console.log(this.likes);
      },
      (error) => {
        console.error('Error fetching liked projections:', error);
      }
    );
  }

  getProjectionImage(projection: ProjectionModel): SafeResourceUrl 
  {
    if (projection && projection.img && projection.img.data) 
    {
      const base64String = Buffer.from(projection.img.data).toString('base64');
      const imageBase64 = 'data:' + projection.img.contentType + ';base64,' + base64String;
      const imageToShow = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
      return imageToShow
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  navigateToDetails(projection: ProjectionModel): void 
  {
    this.router.navigate(['/details', projection._id], {state:{data:projection}});
  }

  handleDeleteReservation(): void
  {
    this.loadFutureReservations(this.userId);
  }
  handleLikeReservation(): void
  {
    this.loadLikedProjections(this.userId);
  }
  handleDislikeReservation(): void
  {
    this.loadLikedProjections(this.userId);
  }
}
