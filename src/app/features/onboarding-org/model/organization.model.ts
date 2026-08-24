export interface OrganizationRequest {
  orgName: string;
  slug: string;
  status: string;
  description: string;
}

export interface OrganizationResponse {
  id: string;
  orgName: string;
  slug: string;
  status: string;
  description: string;
  createAt: Date | string;
}

export interface OrgMemberRequest {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}

export interface OrgMemberResponse {
  id: string;
  orgName: string;
  slug: string;
  role: OrgRole;
}

export enum OrgRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  OWNER = 'OWNER',
}
