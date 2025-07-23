import { Kudos } from './kudos.entity';

export interface CreateKudosData {
  category: string;
  fromUser: string;
  toUser: string;
  message: string;
}

export interface KudosRepository {
  create(kudosData: CreateKudosData): Promise<Kudos>;
  list(): Promise<Kudos[]>;
}
