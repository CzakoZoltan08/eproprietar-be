import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userRepository: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.FIREBASE_PRIVATE_KEY,
    });
  }

  async validate(payload) {
    console.log('payload', payload);
    const user = {
      email: payload.email,
      userId: payload.user_id,
    };
    return user;
  }

  // private get app(): admin.app.App {
  //   return admin.app();
  // }
  //
  // async validate(token: string) {
  //   const firebaseUser = await this.app
  //     .auth()
  //     .verifyIdToken(token, true)
  //     .catch((err) => {
  //       console.log(err);
  //       throw new UnauthorizedException(err.message);
  //     });
  //   if (!firebaseUser) {
  //     throw new UnauthorizedException();
  //   }
  //   const { firstName, lastName } = await this.findUser(firebaseUser);
  //   firebaseUser.firstName = firstName;
  //   firebaseUser.lastName = lastName;
  //   return firebaseUser;
  // }
  //
  // async findUser(firebaseUser: DecodedIdToken): Promise<{
  //   firstName: string;
  //   lastName: string;
  // }> {
  //   const user = await this.userRepository.findOneByFirebaseId(
  //     firebaseUser.uid,
  //   );
  //   if (user) {
  //     return {
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //     };
  //   }
  //   throw new UnauthorizedException('User not found in database.');
  // }
}
