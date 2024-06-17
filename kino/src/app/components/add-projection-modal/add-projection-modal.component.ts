import { Component, OnInit, TemplateRef, Input, ViewChild, ElementRef, ContentChildren, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CrudService } from '../../shared/crudService';
import { AuthService } from '../../shared/authService';
import { ProjectionModel } from '../../shared/projectionModel';

@Component({
  selector: 'app-add-projection-modal',
  templateUrl: './add-projection-modal.component.html',
  styleUrls: ['./add-projection-modal.component.scss']
})
export class AddProjectionModalComponent implements OnInit {
  @Input() projection: ProjectionModel; 
  @ViewChild('content', { static: true }) modalContent!: TemplateRef<any>;
  @Output() addOrUpdateProjectionEvent = new EventEmitter<ProjectionModel>();
  closeResult = '';
  projectionForm: FormGroup;
  userId: string;
  role: string;
  selectedFile: File | null = null;

  constructor(
    private modalService: NgbModal,
    private crudService: CrudService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.projectionForm = this.formBuilder.group({
      _id: [this.projection?._id || ''], 
      title: [this.projection?.title || '', Validators.required],
      description: [this.projection?.description || '', Validators.required],
      runningTime: [this.projection?.runningTime || '', Validators.required],
      image: [null],
      availableSeats: [this.projection?.availableSeats || 0, [Validators.required, Validators.min(0)]],
      takenSeats: [this.projection?.takenSeats || 0],
      showTime: [this.projection?.showTime || '', Validators.required],
      createdBy: [this.projection?.createdBy || '']
    });

    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.role = response.user.role;
        if (!this.projection?.createdBy) 
        {
          this.projectionForm.patchValue({createdBy: this.userId});
        }
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  openModal(projection?: ProjectionModel): void 
  {
    if (projection) 
    {
      this.projection = projection;
      this.projectionForm.patchValue({
        _id: projection._id,
        title: projection.title,
        description: projection.description,
        runningTime: projection.runningTime,
        availableSeats: projection.availableSeats,
        takenSeats: projection.takenSeats,
        showTime: projection.showTime,
        createdBy: projection.createdBy
      });
    }
    else
    {
      this.projectionForm.reset();
    }
    this.open(this.modalContent);
  }

  open(content: TemplateRef<any>): void 
  {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        if (result === 'Save click') 
        {
          if (this.projectionForm.get('_id')?.value) { this.updateProjection(); }
          else { this.addProjection(); }     
        }
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  updateProjection(): void 
  {
    if (this.projectionForm.valid) 
    {
      const formData = new FormData();
      formData.append('_id', this.projectionForm.get('_id')?.value || '');
      formData.append('title', this.projectionForm.get('title')?.value);
      formData.append('description', this.projectionForm.get('description')?.value);
      formData.append('runningTime', this.projectionForm.get('runningTime')?.value);
      formData.append('availableSeats', this.projectionForm.get('availableSeats')?.value);
      formData.append('takenSeats', this.projectionForm.get('takenSeats')?.value);
    
      const showTimeValue = this.projectionForm.get('showTime')?.value;
      if (showTimeValue) 
      {
        const showTime = new Date(showTimeValue);
        formData.append('showTime', showTime.toISOString());
      }
  
      formData.append('createdBy', this.projectionForm.get('createdBy')?.value);
  
      if (this.selectedFile) 
      {
        formData.append('image', this.selectedFile);
      }
  
      const id = this.projectionForm.get('_id')?.value;
      this.crudService.editProjection(id, formData).subscribe(
        (response) => {
          console.log('Projection updated successfully', response);
          this.addOrUpdateProjectionEvent.emit(response);
        },
        (error) => {
          console.error('Error updating projection', error);
        }
      );
    }
  }

  private addProjection(): void 
  {
    if (this.projectionForm.valid) 
    {
      const showTime = new Date(this.projectionForm.value.showTime);
      const formData = new FormData();
      formData.append('title', this.projectionForm.get('title')?.value);
      formData.append('description', this.projectionForm.get('description')?.value);
      formData.append('runningTime', this.projectionForm.get('runningTime')?.value);
      formData.append('availableSeats', this.projectionForm.get('availableSeats')?.value);
      formData.append('takenSeats', this.projectionForm.get('takenSeats')?.value);
      formData.append('showTime', showTime.toISOString());
      formData.append('createdBy', this.userId);

      if (this.selectedFile) 
      {
        formData.append('image', this.selectedFile);
      }

      this.crudService.addProjection(formData).subscribe(
        (response) => {
          console.log('Projection added successfully', response);
          this.addOrUpdateProjectionEvent.emit(response);
        },
        (error) => {
          console.error('Error adding projection', error);
        }
      );
    }
  }


  private getDismissReason(reason: any): string 
  {
    switch (reason) 
    {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  onFileSelected(event: Event): void 
  {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) 
    {
      this.selectedFile = input.files[0];
      this.projectionForm.patchValue({ image: this.selectedFile.name });
    }
  }
}
