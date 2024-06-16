import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CrudService } from '../../shared/crudService';
import { ProjectionModel } from '../../shared/projectionModel';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AddProjectionModalComponent } from '../../components/add-projection-modal/add-projection-modal.component';
import { CommonModule } from '@angular/common';
import { AddProjectionModalModule } from '../../components/add-projection-modal/add-projection-modal.module';
import { MovieElementModule } from '../../components/movie-element/movie-element.module';
import { AuthService } from '../../shared/authService';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [NgbNavModule, CommonModule, AddProjectionModalModule, MovieElementModule],
})
export class AdminComponent implements OnInit {
  @ViewChild('content', { static: true }) modalContent!: TemplateRef<any>;
  @ViewChild(AddProjectionModalComponent) addProjectionModal!: AddProjectionModalComponent;
  active = 1;
  futureProjections: ProjectionModel[] = [];
  pastProjections: ProjectionModel[] = [];
  role: string;

  constructor(private crudService: CrudService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadFutureProjections();
    this.loadPastProjections();

    this.authService.getUser().subscribe(
      (response) => {
        this.role = response.user.role;
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  loadFutureProjections(): void {
    this.crudService.getFutureProjections().subscribe(
      (response) => {
        this.futureProjections = response.projections.sort((a, b) => {
          return new Date(a.showTime).getTime() - new Date(b.showTime).getTime();
        });
      },
      (error) => {
        console.error('Error fetching future projections:', error);
      }
    );
  }

  loadPastProjections(): void {
    this.crudService.getPastProjections().subscribe(
      (response) => {
        this.pastProjections = response.projections.sort((a, b) => {
          return new Date(b.showTime).getTime() - new Date(a.showTime).getTime();
        });
      },
      (error) => {
        console.error('Error fetching past projections:', error);
      }
    );
  }

  openAddProjectionModal(projection?: ProjectionModel): void {
    this.addProjectionModal.openModal(projection);
  }
}
