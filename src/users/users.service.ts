import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AnnouncementsService } from '../announcements/announcements.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => AnnouncementsService))
    private readonly announcementService: AnnouncementsService,
  ) {}

  async create(createUserDto: CreateUserRequestDto) {
    const foundUser = await this.findByEmail(createUserDto.email);

    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    return this.userRepo.save(createUserDto);
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string) {
    return this.userRepo.findOne({
      where: {
        id,
      },
    });
  }

  async getFavouriteAnnouncements(id: string) {
    const userById = await this.userRepo.findOne({
      where: {
        id,
      },
    });

    const favAnnouncements = [];
    if (userById?.favourites?.length) {
      await Promise.all(
        userById.favourites.map(async (announcementId) => {
          const announcement = await this.announcementService.findOne(
            announcementId,
          );
          favAnnouncements.push(announcement);
        }),
      );
    }

    return favAnnouncements;
  }

  findOneByFirebaseId(firebaseId: string) {
    return this.userRepo.findOne({
      where: {
        firebaseId,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(id, updateUserDto);

    return this.findOne(id);
  }

  async delete(id: string) {
    return this.userRepo.delete(id);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }
}
