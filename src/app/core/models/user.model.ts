export type Role = 'admin' | 'mesero' | 'cocinero' | 'bartender';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
