import { Component, OnInit } from '@angular/core';
import { ProjectionModel } from '../../shared/projectionModel';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MakeReservationModalModule } from '../../components/make-reservation-modal/make-reservation-modal.module';
import { CrudService } from '../../shared/crudService';
import { Buffer } from 'buffer';
import { AuthService } from '../../shared/authService';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
  standalone: true,
	imports: [CommonModule, NgbNavModule, MakeReservationModalModule],
})
export class DetailsComponent implements OnInit 
{
  projection: ProjectionModel;
  imageToShow: SafeResourceUrl;
  reservations: any[] = [];
  role: string;

  constructor(
    private sanitizer: DomSanitizer,
    private crudService: CrudService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.projection = history.state.data;
    if (this.projection && this.projection.img && this.projection.img.data) {
      let imageBase64: string;
      if (typeof this.projection.img.data === 'string') {
        // Already in Base64 format for liked projections
        imageBase64 = 'data:' + this.projection.img.contentType + ';base64,' + this.projection.img.data;
      } else {
        // Convert to Base64 assuming it's a Buffer or similar structure for main projection
        imageBase64 = 'data:' + this.projection.img.contentType + ';base64,' + Buffer.from(this.projection.img.data).toString('base64');
      }
      this.imageToShow = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
    }
    this.loadProjectionReservations(this.projection._id);

    this.authService.getUser().subscribe(
      (response) => {
        this.role = response.user.role;
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  loadProjectionReservations(projectionId: string): void {
    this.crudService.getReservationsForProjection(projectionId).subscribe(
      (response) => {
        this.reservations = response.reservations;
      },
      (error) => {
        console.error('Error fetching reservations:', error);
      }
    );
  }

  adminDeleteReservation(userId: string)
  {
    console.log(userId);
    console.log(this.projection._id);
    console.log(this.reservations);
    this.crudService.deleteReservation(userId, this.projection._id).subscribe(
      (deleteResponse) => {
        console.log(deleteResponse);
        console.log("reservation deleted", userId);
      },
      (error) => {
        console.error('Error deleting reservation', error);
      }
    );
    this.loadProjectionReservations(this.projection._id);
  }
}
