import { UseCase } from '../../../../../shared/core/use-case';
import { Result } from '../../../../../shared/core/result';
import { Kudos } from '../../../domain/kudos.entity';
import { KudosRepository } from '../../../domain/kudos.repository';

export type ListKudosResponse = Result<Kudos[], string>;

export class ListKudosUseCase implements UseCase<void, ListKudosResponse> {
  constructor(private readonly kudosRepository: KudosRepository) {}

  async execute(): Promise<ListKudosResponse> {
    try {
      const kudos = await this.kudosRepository.list();
      return Result.ok(kudos);
    } catch (error) {
      console.error('Error listing kudos:', error);
      return Result.fail('Failed to retrieve kudos');
    }
  }
}
