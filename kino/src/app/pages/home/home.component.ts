import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../shared/crudService';
import { ProjectionModel } from '../../shared/projectionModel';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit
{
  futureProjections: ProjectionModel[] = [];

  constructor(private crudService: CrudService) {}

  ngOnInit(): void 
  {
    this.loadFutureProjections();
  }

  loadFutureProjections(): void 
  {
    this.crudService.getFutureProjections().subscribe(
      (response) => {
        this.futureProjections = response.projections.sort((a,b) => {
          return new Date(a.showTime).getTime() - new Date(b.showTime).getTime();
        });
      },
      (error) => {
        console.error('Error fetching future projections:', error);
      }
    );
  }

  handleProjectionDeleted(projectionId: string): void 
  {
    this.futureProjections = this.futureProjections.filter(projection => projection._id !== projectionId);
  }
}
