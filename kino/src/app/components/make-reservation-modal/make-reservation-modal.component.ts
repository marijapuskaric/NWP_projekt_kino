import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CrudService } from '../../shared/crudService';
import { AuthService } from '../../shared/authService';
import { ProjectionModel } from '../../shared/projectionModel';

@Component({
  selector: 'app-make-reservation-modal',
  templateUrl: './make-reservation-modal.component.html',
  styleUrl: './make-reservation-modal.component.scss'
})
export class MakeReservationModalComponent implements OnInit
{
  @Input() projection: ProjectionModel;
  closeResult = '';
  reservationForm: FormGroup;
  userId: string;
  role: string;
  userAuthenticated = false;

  constructor(
    private modalService: NgbModal,
    private crudService: CrudService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void 
  {
    console.log("Projection id:", this.projection._id);
    this.reservationForm = this.formBuilder.group({
      numOfSeats: ['', Validators.required],
      projeciton: [''],
      madeBy: ['']
    });

    this.reservationForm.patchValue({
      projection: this.projection._id
    })

    this.userAuthenticated = this.authService.getIsAuthenticated();
    this.authService.getUser().subscribe(
      (response) => {
        this.userId = response.user._id;
        this.role = response.user.role;
        this.reservationForm.patchValue({ madeBy: this.userId });
      },
      (error) => {
        console.error('Error fetching user information', error);
      }
    );
  }

  open(content: TemplateRef<any>): void 
  {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        if (result === 'Save click') { this.addReservation(); }
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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

  private addReservation(): void 
  {
    if (this.reservationForm.valid) 
    {
      var seats = this.reservationForm.get('numOfSeats')?.value
      if(this.projection.takenSeats + seats <= this.projection.availableSeats)
      {
        const reservationData = {
          numOfSeats: this.reservationForm.get('numOfSeats')?.value,
          projection: this.reservationForm.get('projection')?.value,
          madeBy: this.reservationForm.get('madeBy')?.value
        };
  
        this.crudService.makeReservation(this.projection._id, reservationData).subscribe(
          (response) => {
            console.log('Reservation made successfully', response);
          },
          (error) => {
            console.error('Error making a reservation', error);
          }
        );
      }
      else
      {
        console.log('Not enough seats available');
      }
    }
  }
}
  
