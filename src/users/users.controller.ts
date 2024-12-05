import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(new TransformInterceptor(CreateUserResponseDto))
  @ApiOkResponse({ type: CreateUserResponseDto })
  create(@Body() createUserDto: CreateUserRequestDto) {
    return this.usersService.create(createUserDto);
  }

  // @UseGuards(AuthGuard)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('/by-email/:email')
  getByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  // @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get('/get-favourites/:id')
  getFavouriteAnnouncements(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getFavouriteAnnouncements(id);
  }

  // @UseGuards(AuthGuard)
  @Patch('/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() project: UpdateUserDto,
  ) {
    return this.usersService.update(id, project);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
