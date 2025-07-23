import { Router, Request, Response } from 'express';
import { CreateKudosUseCase } from '../../application/use-cases/create-kudos/create-kudos.use-case';
import { ListKudosUseCase } from '../../application/use-cases/list-kudos/list-kudos.use-case';
import { KudosController } from '../controllers/kudos.controller';

interface KudosRoutesDependencies {
  createKudosUseCase: CreateKudosUseCase;
  listKudosUseCase: ListKudosUseCase;
}

const setupKudosRoutes = (dependencies: KudosRoutesDependencies): Router => {
  const router = Router();
  const kudosController = new KudosController(dependencies.createKudosUseCase, dependencies.listKudosUseCase);

  router.post('/create', async (req: Request, res: Response) => {
    const result = await kudosController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  router.get('/', async (req: Request, res: Response) => {
    const result = await kudosController.handleList(req);
    res.status(result.statusCode).json(result.body);
  });

  return router;
};

export default setupKudosRoutes;
