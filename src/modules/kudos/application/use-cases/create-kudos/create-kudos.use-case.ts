import { UseCase } from '../../../../../shared/core/use-case';
import { Result } from '../../../../../shared/core/result';
import { Kudos } from '../../../domain/kudos.entity';
import { KudosRepository, CreateKudosData } from '../../../domain/kudos.repository';
import { ValidationError } from '../../../../user/domain/errors/validation.error';

export interface CreateKudosDTO {
  category: string;
  from: string;
  to: string;
  message: string;
}

export type CreateKudosResponse = Result<Kudos, string | ValidationError>;

export class CreateKudosUseCase implements UseCase<CreateKudosDTO, CreateKudosResponse> {
  constructor(private readonly kudosRepository: KudosRepository) {}

  async execute(request: CreateKudosDTO): Promise<CreateKudosResponse> {
    // Validation
    if (!request.category?.trim()) {
      return Result.fail(new ValidationError('Category is required.'));
    }

    if (!request.from?.trim()) {
      return Result.fail(new ValidationError('From user is required.'));
    }

    if (!request.to?.trim()) {
      return Result.fail(new ValidationError('To user is required.'));
    }

    if (!request.message?.trim()) {
      return Result.fail(new ValidationError('Message is required.'));
    }

    try {
      const kudosData: CreateKudosData = {
        category: request.category.trim(),
        fromUser: request.from.trim(), // Map 'from' to 'fromUser'
        toUser: request.to.trim(), // Map 'to' to 'toUser'
        message: request.message.trim(),
      };

      const kudos = await this.kudosRepository.create(kudosData);
      return Result.ok(kudos);
    } catch (error) {
      console.error('Error creating kudos:', error); // Add logging for debugging
      return Result.fail('Failed to create kudos');
    }
  }
}
