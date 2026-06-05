import { Request } from 'express';
import { IUser } from './models/User';

export interface Context {
  req: Request;
  viewer?: IUser | null;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  // In a real application, we would check for a JWT token in the Authorization header.
  // For this bootstrapped project, we return null by default.
  return {
    req,
    viewer: null,
  };
}
