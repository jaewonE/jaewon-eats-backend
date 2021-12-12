import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';
import { ROLES_META } from './role.constant';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => SetMetadata(ROLES_META, roles);
