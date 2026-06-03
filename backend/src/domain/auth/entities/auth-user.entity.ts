import { Entity } from '../../shared/entity.base';
import { UserRole } from '../enums/user-role.enum';

export class AuthUser extends Entity<string> {
  constructor(
    id: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly emailVerified: boolean,
    public readonly locale: string,
    public readonly name: string | null,
    public readonly passwordHash: string | null,
  ) {
    super(id);
  }
}
