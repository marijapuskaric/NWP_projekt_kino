import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProjectionModel } from '../../shared/projectionModel';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CrudService } from '../../shared/crudService';
import { AuthService } from '../../shared/authService';

@Component({
  selector: 'app-movie-element-profile',
  templateUrl: './movie-element-profile.component.html',
  styleUrls: ['./movie-element-profile.component.scss']
})
export class MovieElementProfileComponent implements OnInit 
{
  @Input() reservation: { projection: ProjectionModel, numberOfSeats: number };
  @Input() active: number;
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() likeEvent = new EventEmitter<any>();
  @Output() dislikeEvent = new EventEmitter<any>();
  imageToShow: SafeResourceUrl;
  userId: string;
  role: string;
  liked: boolean = false;

  constructor(
    private sanitizer: DomSanitizer, 
    private router: Router, 
    private crudService: CrudService, 
    private authService: AuthService
  ) {}

  ngOnInit(): void 
  {
    if (this.reservation.projection && this.reservation.projection.img && this.reservation.projection.img.data) 
    {
      const imageBase64 = 'data:' + this.reservation.projection.img.contentType + ';base64,' + this.reservation.projection.img.data;
      this.imageToShow = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
    }

    console.log(this.active);

    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.role = response.user.role;
        this.crudService.isProjectionLiked(this.userId, this.reservation.projection._id).subscribe(
          (likeStatus) => {
            this.liked = likeStatus.liked;
          },
          (error) => {
            console.error('Error checking if projection is liked', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  navigateToDetails(projection: ProjectionModel): void 
  {
    this.router.navigate(['/details', projection._id], { state: { data: projection } });
  }

  deleteReservation(projectionId: string) 
  {
    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.crudService.deleteReservation(this.userId, projectionId).subscribe(
          (deleteResponse) => {
            console.log(deleteResponse);
            console.log("reservation deleted", projectionId);
            this.deleteEvent.emit();
          },
          (error) => {
            console.error('Error deleting reservation', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  likeProjection(projectionId: string)
  {
    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.crudService.likeProjection(this.userId, projectionId).subscribe(
          (likeResponse) => {
            console.log(likeResponse);
            console.log("projecction liked", projectionId);
            this.liked = true;
            this.likeEvent.emit();
          },
          (likeError) => {
            console.error('Error liking projection', likeError);
          }
        );
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  deleteLike(projectionId: string)
  {
    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.crudService.deleteLike(this.userId, projectionId).subscribe(
          (deleteResponse) => {
            console.log(deleteResponse);
            console.log("like deleted", projectionId);
            this.liked = false;
            this.dislikeEvent.emit();
          },
          (error) => {
            console.error('Error deleting like', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }
}
