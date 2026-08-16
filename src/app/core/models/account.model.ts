export interface UserAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  orgId: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | null;
}
