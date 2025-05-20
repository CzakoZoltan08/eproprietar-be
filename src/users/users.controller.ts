import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransformInterceptor } from '../public/interceptors/transform.interceptor';
import { UsersService } from './users.service';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from './dto/create-user-request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { CreateFirebaseUserDto } from './dto/create-firebase-user.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post()
  @UseInterceptors(new TransformInterceptor(CreateUserResponseDto))
  @ApiOkResponse({ type: CreateUserResponseDto })
  create(@Body() createUserDto: CreateUserRequestDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('/firebase')
  @UseInterceptors(new TransformInterceptor(CreateUserResponseDto))
  @ApiOkResponse({ type: CreateUserResponseDto })
  createFirebase(@Body() createFirebaseUserDto: CreateFirebaseUserDto) {
    return this.usersService.createFirebaseUser(createFirebaseUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/by-email/:email')
  getByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('/get-favourites/:id')
  getFavouriteAnnouncements(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getFavouriteAnnouncements(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() project: UpdateUserDto,
  ) {
    return this.usersService.update(id, project);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('/:id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
