import { Controller } from '../../../../shared/presentation/controller';
import { CreateKudosUseCase, CreateKudosDTO } from '../../application/use-cases/create-kudos/create-kudos.use-case';
import { ListKudosUseCase } from '../../application/use-cases/list-kudos/list-kudos.use-case';
import { HttpResponse } from '../../../../shared/presentation/http-response';
import { ValidationError } from '../../../user/domain/errors/validation.error';
import { Request } from 'express';

export interface CreateKudosErrorResponse {
  message: string;
}

export class KudosController implements Controller<Request, any> {
  constructor(
    private readonly createKudosUseCase: CreateKudosUseCase,
    private readonly listKudosUseCase: ListKudosUseCase
  ) {}

  async handle(request: Request): Promise<HttpResponse<any>> {
    const { category, from, to, message }: CreateKudosDTO = request.body;

    try {
      const result = await this.createKudosUseCase.execute({ category, from, to, message });

      if (result.isSuccess) {
        const kudos = result.getValue();
        return HttpResponse.created({
          id: kudos.id.toString(),
          category: kudos.category,
          from: kudos.fromUser,
          to: kudos.toUser,
          message: kudos.message,
          date: kudos.createdAt?.toISOString() || new Date().toISOString(),
        });
      }

      const error = result.error();

      if (error instanceof ValidationError) {
        return HttpResponse.badRequest({
          message: error.message,
        });
      }

      if (typeof error === 'string') {
        return HttpResponse.badRequest({
          message: error,
        });
      }

      return HttpResponse.serverError({
        message: 'An unexpected error occurred',
      });
    } catch (error) {
      return HttpResponse.serverError({
        message: 'An unexpected error occurred',
      });
    }
  }

  async handleList(request: Request): Promise<HttpResponse<any>> {
    try {
      const result = await this.listKudosUseCase.execute();

      if (result.isSuccess) {
        const kudos = result.getValue();
        const kudosResponse = kudos.map((kudo) => ({
          id: kudo.id.toString(),
          category: kudo.category,
          from: kudo.fromUser,
          to: kudo.toUser,
          message: kudo.message,
          date: kudo.createdAt?.toISOString() || new Date().toISOString(),
        }));

        return HttpResponse.ok(kudosResponse);
      }

      return HttpResponse.serverError({
        message: result.error(),
      });
    } catch (error) {
      return HttpResponse.serverError({
        message: 'An unexpected error occurred',
      });
    }
  }
}
