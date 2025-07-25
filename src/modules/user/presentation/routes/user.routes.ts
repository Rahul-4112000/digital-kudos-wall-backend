import { Router, Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { UserController } from '../controllers/user.controller';
import { LoginController } from '../controllers/login.controller';

interface UserRoutesDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUseCase: LoginUseCase;
}

const setupUserRoutes = (dependencies: UserRoutesDependencies): Router => {
  const router = Router();
  const userController = new UserController(dependencies.registerUserUseCase);
  const loginController = new LoginController(dependencies.loginUseCase);

  router.post('/register', async (req: Request, res: Response) => {
    const result = await userController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  router.post('/login', async (req: Request, res: Response) => {
    const result = await loginController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  return router;
};

export default setupUserRoutes;
