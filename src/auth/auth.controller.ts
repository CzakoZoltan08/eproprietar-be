import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/register.dto';
import { TransformInterceptor } from '../public/interceptors/transform.interceptor';
import { Public } from '../public/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(new TransformInterceptor(AuthRequestDto))
  @Public()
  @Post('register')
  register(@Body() body: AuthRequestDto) {
    return this.authService.register(body);
  }
}
