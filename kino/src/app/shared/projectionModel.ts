import { Buffer } from 'buffer';
export interface ProjectionModel 
{
  _id: string;
  title: string;
  description: string;
  runningTime: string;
  img?: {
    data: Buffer;
    contentType: string;
  };
  availableSeats: number;
  takenSeats?: number;
  showTime: string;
  createdBy: string;
}
  