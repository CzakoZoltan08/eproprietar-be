import { CloudinaryService } from '../public/cloudinary.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FindOptionsWhere, In, LessThanOrEqual, Equal, Not, IsNull, LessThan, Repository, Between } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { UsersService } from '../users/users.service';
import { AnnouncementPayment } from 'src/payment/entities/announcement-payment.entity';
import { PaginateQuery, Paginated } from 'nestjs-paginate';


function normalizeFilterValue(value: string | string[] | undefined, pattern: RegExp): string | undefined {
  if (!value) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  return str.replace(pattern, '').trim();
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto): Promise<Announcement> {
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

  async findByUserId(userId: string): Promise<Announcement[]> {
    return this.announcementRepo.find({
      where: { user: { id: userId } },
      relations: { user: true },
    });
  }

  buildPaginationLinks(query: PaginateQuery, totalPages: number, currentPage: number): { first?: string; previous?: string; current: string; next?: string; last?: string } {
    const baseUrl = query.path;
    const queryParams = new URLSearchParams(query.search);
  
    const makeLink = (page: number) => {
      queryParams.set('page', page.toString());
      return `${baseUrl}?${queryParams.toString()}`;
    };
  
    return {
      first: makeLink(1),
      previous: currentPage > 1 ? makeLink(currentPage - 1) : undefined,
      current: makeLink(currentPage),
      next: currentPage < totalPages ? makeLink(currentPage + 1) : undefined,
      last: makeLink(totalPages),
    };
  }

  async findAllPaginated(query: PaginateQuery): Promise<Paginated<Announcement>> {
    const where: FindOptionsWhere<Announcement> = {};

    const filters = query.filter ?? {};

    // Clean up and apply filters
    const city = normalizeFilterValue(filters.city, /^\$in:\$in:/);
    if (city) where.city = In([city]);

    const county = normalizeFilterValue(filters.county, /^\$in:\$in:/);
    if (county) where.county = In([county]);

    const maxPriceStr = normalizeFilterValue(filters.price, /^\$lte:\$lte:/);
    if (maxPriceStr) where.price = LessThanOrEqual(Number(maxPriceStr));

    const surfaceStr = normalizeFilterValue(filters.surface, /^\$btw:/);
    if (surfaceStr) {
      const [min, max] = surfaceStr.split(',').map(Number);
      where.surface = Between(min || 0, max || Number.MAX_SAFE_INTEGER);
    }

    const announcementType = normalizeFilterValue(filters.announcementType, /^\$in:/);
    if (announcementType) where.announcementType = Equal(announcementType);

    const providerType = normalizeFilterValue(filters.providerType, /^\$in:/);
    if (providerType) where.providerType = Equal(providerType);

    if(announcementType === 'apartament') {
      const roomsStr = normalizeFilterValue(filters.rooms, /^\$eq:\$eq:/);
      if (roomsStr) where.rooms = Equal(Number(roomsStr));
    }

    const userId = normalizeFilterValue(filters.user, /^\$eq:/);
    if (userId) where.user = { id: userId };


    const transactionType = normalizeFilterValue(filters.transactionType, /^\$in:/);
    if (transactionType) where.transactionType = Equal(transactionType);

    const status = normalizeFilterValue(filters.status, /^\$in:/);
    where.status = status ? Equal(status) : Equal('active');

    const announcements = await this.announcementRepo.find({
      where,
      relations: ['user', 'agency'],
    });

    // Promotion lookup
    const promotedIds = announcements.filter(a => a.isPromoted).map(a => a.id);

    const promotionPayments = await this.announcementRepo.manager.find(AnnouncementPayment, {
      where: {
        promotion: { id: Not(IsNull()) },
        announcement: { id: In(promotedIds) },
      },
      relations: ['announcement'],
      order: { createdAt: 'DESC' },
    });

    const latestPromoDateMap = new Map<string, Date>();
    for (const payment of promotionPayments) {
      const annId = payment.announcement.id;
      if (!latestPromoDateMap.has(annId)) {
        latestPromoDateMap.set(annId, payment.createdAt);
      }
    }

    const enriched = announcements.map(a => ({
      announcement: a,
      isPromoted: a.isPromoted,
      promoDate: latestPromoDateMap.get(a.id) ?? null,
    }));

    enriched.sort((a, b) => {
      if (a.isPromoted !== b.isPromoted) return a.isPromoted ? -1 : 1;
      const dateA = a.promoDate?.getTime() ?? 0;
      const dateB = b.promoDate?.getTime() ?? 0;
      if (dateA !== dateB) return dateB - dateA;
      return new Date(b.announcement.createdAt).getTime() - new Date(a.announcement.createdAt).getTime();
    });

    const sortedAnnouncements = enriched.map(e => e.announcement);
    const total = sortedAnnouncements.length;
    const page = query.page ?? 1;
    const limit = query.limit ?? total;
    const offset = (page - 1) * limit;
    const paginated = sortedAnnouncements.slice(offset, offset + limit);

    return {
      data: paginated,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        sortBy: [],
        searchBy: [],
        search: '',
        select: [],
      },
      links: this.buildPaginationLinks(query, Math.ceil(total / limit), page),
    };
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
    await this.announcementRepo.update(
      id,
      updateAnnouncementDto,
    );

    return this.findOne(id);
  }

  async removeByStatusAndTime(status: string = 'pending', hours: number = 24) {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - hours);

    // Find pending announcements older than 24 hours
    const expiredAnnouncements = await this.announcementRepo.find({
      where: {
        status: status, // Ensure the field matches your entity (change if necessary)
        createdAt: LessThan(twentyFourHoursAgo),
      },
      relations: { user: true }, // Ensure user relation is loaded
    });

    let deletedCount = 0;
    
    for (const announcement of expiredAnnouncements) {
      const userId = announcement.user?.id;
      if (!userId) continue;

      const announcementId = announcement.id;
      await this.remove(announcementId)
      deletedCount++;
    }

    return deletedCount;
  }

  async remove(id: string) {
    // Fetch the announcement with the user relation to get userId
    const announcement = await this.announcementRepo.findOne({
        where: { id }
    });

    if (!announcement) {
        throw new BadRequestException(`Announcement not found.`);
    }

    const announcementId = id;

    // Define folders for images and videos
    const imageFolder = `announcements/${announcementId}/images`;
    const videoFolder = `announcements/${announcementId}/videos`;
    const announcementFolder = `announcements/${announcementId}`;

    // Delete all related media from Cloudinary
    await this.deleteFilesInFolder(imageFolder, 'image');
    await this.deleteFilesInFolder(videoFolder, 'video');

    // Remove announcement from database
    await this.announcementRepo.delete(id);

    try{
      await this.cloudinaryService.deleteFolderIfEmpty(imageFolder); // Deletes images and then folder
      await this.cloudinaryService.deleteFolderIfEmpty(videoFolder); // Deletes videos and then folder
      await this.cloudinaryService.deleteFolderIfEmpty(announcementFolder); // Deletes announcement folder
    }
    catch (error) {
      console.error(`Error deleting folder ${announcementFolder}:`, error);
    }

    return `Announcement #${id} and its media have been deleted`;
  }

  private async deleteFilesInFolder(folder: string, resourceType: 'image' | 'video' = 'image') {
    try {
      // Fetch all resources in the folder
      const resources = await this.cloudinaryService.getResourcesByFolder(folder, resourceType);

      // Extract public_ids of all resources
      const publicIds = resources.map((file: any) => file.public_id);

      if (publicIds.length > 0) {
        // Delete all resources in the folder
        await this.cloudinaryService.deleteResources(publicIds, resourceType);
      }
    } catch (error) {
      console.error(`Error deleting files from Cloudinary folder ${folder}:`, error);
    }
  }
}
