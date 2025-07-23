import { ListKudosUseCase } from './list-kudos.use-case';
import { KudosRepository } from '../../../domain/kudos.repository';
import { Kudos } from '../../../domain/kudos.entity';
import { UniqueEntityID } from '../../../../../shared/domain/unique-entity-id';

describe('ListKudosUseCase (Sociable Unit Test)', () => {
  let useCase: ListKudosUseCase;
  let kudosRepository: jest.Mocked<KudosRepository>;

  beforeEach(() => {
    kudosRepository = {
      create: jest.fn(),
      list: jest.fn(),
    };

    useCase = new ListKudosUseCase(kudosRepository);
  });

  describe('execute', () => {
    it('should successfully return all kudos when they exist', async () => {
      // Arrange
      const kudos1 = Kudos.create(
        {
          category: 'Well Done',
          fromUser: 'John Doe',
          toUser: 'Jane Smith',
          message: 'Great work on the project!',
          createdAt: new Date('2025-01-15'),
        },
        new UniqueEntityID('1')
      );

      const kudos2 = Kudos.create(
        {
          category: 'Great Teamwork',
          fromUser: 'Alice Brown',
          toUser: 'Bob Wilson',
          message: 'Excellent collaboration!',
          createdAt: new Date('2025-01-16'),
        },
        new UniqueEntityID('2')
      );

      const expectedKudos = [kudos1, kudos2];
      kudosRepository.list.mockResolvedValue(expectedKudos);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      const retrievedKudos = result.getValue();
      expect(retrievedKudos).toHaveLength(2);
      expect(retrievedKudos[0].id.toString()).toBe('1');
      expect(retrievedKudos[0].category).toBe('Well Done');
      expect(retrievedKudos[1].id.toString()).toBe('2');
      expect(retrievedKudos[1].category).toBe('Great Teamwork');
      expect(kudosRepository.list).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no kudos exist', async () => {
      // Arrange
      kudosRepository.list.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.isSuccess).toBe(true);
      const retrievedKudos = result.getValue();
      expect(retrievedKudos).toHaveLength(0);
      expect(kudosRepository.list).toHaveBeenCalledTimes(1);
    });

    it('should handle repository error gracefully', async () => {
      // Arrange
      kudosRepository.list.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error()).toBe('Failed to retrieve kudos');
      expect(kudosRepository.list).toHaveBeenCalledTimes(1);
    });
  });
});
