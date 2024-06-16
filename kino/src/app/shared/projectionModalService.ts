import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectionModel } from './projectionModel';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProjectionModalComponent } from '../components/add-projection-modal/add-projection-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ProjectionModalService {
    addProjectionModal: AddProjectionModalComponent;
    modalService: NgbModal;

  constructor(modalService: NgbModal) {}

  openProjectionModal(projection: ProjectionModel): void {
    this.modalService.open(this.addProjectionModal, {
        windowClass: 'dark-modal',
      });
  }
}