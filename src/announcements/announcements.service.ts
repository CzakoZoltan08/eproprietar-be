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
    // return Promise.resolve([
    //   {
    //     id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
    //     announcementType: 'SALE',
    //     providerType: 'OWNER',
    //     transactionType: 'BUY',
    //     title: 'Spacious Apartment in Downtown',
    //     city: 'New York',
    //     street: 'Main Street 123',
    //     price: 350000,
    //     deleted: false,
    //     currency: 'EURO',
    //     apartamentPartitioning: 'OPEN',
    //     status: 'active',
    //     comfortLevel: 'High',
    //     rooms: 3,
    //     numberOfKitchens: 1,
    //     surface: 120,
    //     schema: 'modern',
    //     description: 'A luxurious 3-room apartment with a great city view.',
    //     partitioning: 'modern',
    //     baths: 2,
    //     floor: 5,
    //     isNew: true,
    //     balcony: 'LARGE',
    //     parking: 'GARAGE',
    //     stage: 'finished',
    //     endDate: '2024-12-31',
    //     isExclusivity: true,
    //     user: {
    //       id: 'user123',
    //       name: 'John Doe',
    //       email: 'john.doe@example.com',
    //     },
    //     agency: null,
    //     createdAt: new Date('2024-01-01T12:00:00Z'),
    //     updatedAt: new Date('2024-11-01T12:00:00Z'),
    //   },
    // ]);

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
