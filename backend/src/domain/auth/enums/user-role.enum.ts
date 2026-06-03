export enum UserRole {
  Buyer = 'buyer',
  Agent = 'agent',
  Admin = 'admin',
}

export function parseUserRole(value: string): UserRole | null {
  if (Object.values(UserRole).includes(value as UserRole)) {
    return value as UserRole;
  }
  return null;
}
