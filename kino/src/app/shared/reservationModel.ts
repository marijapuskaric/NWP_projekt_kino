export interface ReservationModel {
  _id: string;
  userId: {
    username: string;
  };
  projectionId: string;
  numberOfSeats: number;
}