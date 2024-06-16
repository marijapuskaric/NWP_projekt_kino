import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ProjectionModel } from './projectionModel';
import { ReservationModel } from './reservationModel';
import { LikeModel } from './likeModel';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  constructor(private http: HttpClient) {}

  addProjection(projectionData: FormData): Observable<any>
  {
    console.log("crud");
    return this.http.post<any>('http://localhost:3000/createProjection', projectionData);
  }

  getFutureProjections(): Observable<{ projections: ProjectionModel[] }> {
    return this.http.get<{ projections: ProjectionModel[] }>('http://localhost:3000/futureProjections');    
  }

  getPastProjections(): Observable<{projections: ProjectionModel[]}>
  {
    return this.http.get<{projections: ProjectionModel[]}>('http://localhost:3000/pastProjections');
  }

  getProjectionById(id: string): Observable<ProjectionModel>
  {
    return this.http.get<ProjectionModel>(`http://localhost:3000/projection/${id}`);
  }

  deleteProjection(id: string): Observable<any>
  {
    return this.http.post<any>(`http://localhost:3000/deleteProjection/${id}`, { projectionId: id });
  }

  editProjection(id: string, projectionData: FormData): Observable<any>
  {
    return this.http.post<any>(`http://localhost:3000/editProjection/${id}`, projectionData);
  }

  makeReservation(id: string, reservationData: any): Observable<any>
  {
    return this.http.post<any>(`http://localhost:3000/makeReservation/${id}`, reservationData);
  }

  deleteReservation(userId: string, projectionId: string): Observable<any> 
  {
    return this.http.post<any>(`http://localhost:3000/deleteReservation/${projectionId}`, { userId: userId });
  }

  getUserFutureReservations(userId: string): Observable<{ futureReservations: { projection: ProjectionModel, numberOfSeats: number }[] }> {
    return this.http.get<{ futureReservations: { projection: ProjectionModel, numberOfSeats: number }[] }>(`http://localhost:3000/futureReservations/${userId}`);
  }

  getUserPastReservations(userId: string): Observable<{ pastReservations: { projection: ProjectionModel, numberOfSeats: number }[] }> {
    return this.http.get<{ pastReservations: { projection: ProjectionModel, numberOfSeats: number }[] }>(`http://localhost:3000/pastReservations/${userId}`);
  }

  getReservationsForProjection(id: string): Observable<any>
  {
    return this.http.get<any>(`http://localhost:3000/reservations/${id}`);
  }

  likeProjection(userId: string, projectionId: string): Observable<any>
  {
    return this.http.post<any>(`http://localhost:3000/likeProjection/${projectionId}`, {userId: userId});
  }

  deleteLike(userId: string, projectionId: string): Observable<any>
  {
    return this.http.post<any>(`http://localhost:3000/deleteLike/${projectionId}`, {userId: userId});
  }

  getLikes(id: string): Observable<any>
  {
    return this.http.get<any>(`http://localhost:3000/likes/${id}`);
  }

  isProjectionLiked(userId: string, projectionId: string): Observable<{ liked: boolean }> {
    return this.http.get<{ liked: boolean }>(`http://localhost:3000/likes/${userId}/${projectionId}`);
  }
}
