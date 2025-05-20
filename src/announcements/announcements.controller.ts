import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { UseGuards } from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Announcement } from './entities/announcement.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAnnouncementDto: CreateAnnouncementDto): Promise<Announcement> {
    var announcement = await this.announcementsService.create(createAnnouncementDto);
    return announcement;
  }

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get('/paginated')
  async findAllPaginated(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Announcement>> {
    return this.announcementsService.findAllPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
