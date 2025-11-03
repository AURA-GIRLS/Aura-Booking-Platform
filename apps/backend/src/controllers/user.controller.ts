import type { Request, Response } from 'express';
import type { ApiResponseDTO } from '../types';
import { userService } from '@services/user.service';
export class UserController{
     async getUserById(req: Request, res: Response): Promise<void> {
        try {
        const userId = req.params.id;
    
        console.log("Fetching user with ID:", userId);
          const user = await userService.getUserById(userId);
          
          const response: ApiResponseDTO = {
            success: true,
            data: {
              _id: user?._id.toString(),
              fullName: user?.fullName,
              email: user?.email,
              phoneNumber: user?.phoneNumber,
              avatarUrl: user?.avatarUrl,
              role: user?.role,
              status: user?.status,
              isEmailVerified: user?.isEmailVerified,
              createdAt: user?.createdAt
            }
          };
          
          res.status(200).json(response);
        } catch (error) {
          const response: ApiResponseDTO = {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get profile'
          };
          res.status(500).json(response);
        }
      }
}
export default new UserController();