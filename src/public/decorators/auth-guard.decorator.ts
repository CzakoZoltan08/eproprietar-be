import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { FirebaseAdmin } from '../../../config/firebase/firebase.setup';

export function AuthGuard(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(FirebaseAdmin),
  );
}
