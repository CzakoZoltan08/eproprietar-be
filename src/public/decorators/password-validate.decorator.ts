import { BadRequestException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

import PasswordValidator from 'password-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          if (!value || !value.length) return false;
          const schema = new PasswordValidator();
          schema
            .is()
            .min(8)
            .is()
            .max(20)
            .has()
            .uppercase()
            .has()
            .lowercase()
            .has()
            .digits()
            .has()
            .not()
            .spaces();
          const validated = schema.validate(value, { details: true }) as any[];
          if (!validated.length) return true;
          throw new BadRequestException(validated);
        },
      },
    });
  };
}
