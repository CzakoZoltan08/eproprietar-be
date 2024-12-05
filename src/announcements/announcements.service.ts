import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, PaginateQuery } from 'nestjs-paginate';

import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { PaginateConfigAnnouncements } from './announcements.paginate';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    const firebaseId = createAnnouncementDto?.user?.firebaseId;
    if (!firebaseId) {
      throw new BadRequestException('User firebaseId not provided');
    }
    const user = await this.usersService.findOneByFirebaseId(firebaseId);

    return this.announcementRepo.save({
      ...createAnnouncementDto,
      user: user,
    });
  }

  findAll() {
    return this.announcementRepo.find({
      relations: {
        user: true,
      },
    });
  }

  async findAllPaginated(query: PaginateQuery) {
    const config = PaginateConfigAnnouncements;

    const paginated = await paginate<Announcement>(
      query,
      this.announcementRepo,
      config,
    );

    return paginated;
  }

  findOne(id: string) {
    return this.announcementRepo.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
        agency: true,
      },
    });
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    const update = await this.announcementRepo.update(
      id,
      updateAnnouncementDto,
    );

    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} announcement`;
  }
}
