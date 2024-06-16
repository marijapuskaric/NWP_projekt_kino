import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { ProjectionModel } from '../../shared/projectionModel';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CrudService } from '../../shared/crudService';
import { ProjectionModalService } from '../../shared/projectionModalService';
import { AuthService } from '../../shared/authService';


@Component({
  selector: 'app-movie-element',
  templateUrl: './movie-element.component.html',
  styleUrl: './movie-element.component.scss'
})
export class MovieElementComponent implements OnInit {
  @Input() projection: ProjectionModel;
  @Input() active: number;
  @Input() isHome: boolean;
  @Output() edit = new EventEmitter<ProjectionModel>();
  imageToShow: SafeResourceUrl;
  role: string;

  constructor(private sanitizer: DomSanitizer, private router: Router, private crudService: CrudService, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.projection && this.projection.img && this.projection.img.data) {
      const imageBase64 = 'data:' + this.projection.img.contentType + ';base64,' + this.projection.img.data;
      this.imageToShow = this.sanitizer.bypassSecurityTrustResourceUrl(imageBase64);
    }
    this.authService.getUser().subscribe(
      (response) => {
        this.role = response.user.role;
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  navigateToDetails(projection: ProjectionModel): void {
    this.router.navigate(['/details', projection._id], {state:{data:projection}});
  }

  deleteProjection(projectionId: string): void {
    this.crudService.deleteProjection(projectionId).subscribe(
      (response) => {
        console.log(response.message);
      },
      (error) => {
        console.error('Error deleting projection', error);
      }
    );
  }

  editProjection(projection: ProjectionModel): void {
    this.edit.emit(projection);
    
  }
  
}
