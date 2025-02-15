import { CloudinaryService } from '../public/cloudinary.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
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
        where: { id },
        relations: { user: true }, // Ensure the user relation is loaded
    });

    if (!announcement) {
        throw new BadRequestException(`Announcement not found.`);
    }

    if (!announcement.user) {
        throw new BadRequestException(`User for the announcement not found.`);
    }

    const userId = announcement.user.id; // Now safely access the user ID
    const announcementId = id;

    // Define folders for images and videos
    const imageFolder = `users/${userId}/announcements/${announcementId}/images`;
    const videoFolder = `users/${userId}/announcements/${announcementId}/videos`;
    const announcementFolder = `users/${userId}/announcements/${announcementId}`;

    // Delete all related media from Cloudinary
    await this.deleteFilesInFolder(imageFolder, 'image');
    await this.deleteFilesInFolder(videoFolder, 'video');

    // Remove announcement from database
    await this.announcementRepo.delete(id);

    await this.cloudinaryService.deleteFolderIfEmpty(imageFolder); // Deletes images and then folder
    await this.cloudinaryService.deleteFolderIfEmpty(videoFolder); // Deletes videos and then folder
    await this.cloudinaryService.deleteFolderIfEmpty(announcementFolder); // Deletes announcement folder

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
