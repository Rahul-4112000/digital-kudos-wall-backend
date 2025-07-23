import { Entity } from '../../../shared/domain/entity';
import { UniqueEntityID } from '../../../shared/domain/unique-entity-id';

export interface KudosProps {
  category: string;
  fromUser: string;
  toUser: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Kudos extends Entity<KudosProps> {
  get category(): string {
    return this.props.category;
  }

  get fromUser(): string {
    return this.props.fromUser;
  }

  get toUser(): string {
    return this.props.toUser;
  }

  get message(): string {
    return this.props.message;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public static create(props: KudosProps, id?: UniqueEntityID): Kudos {
    const kudos = new Kudos(props, id);
    return kudos;
  }
}
