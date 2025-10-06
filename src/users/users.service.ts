import {
  BadRequestException,
  Body,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider, User } from './entities/user.entity';
import { Raw, Repository } from 'typeorm';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from './dto/create-user-request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AnnouncementsService } from '../announcements/announcements.service';
import { CreateFirebaseUserDto } from './dto/create-firebase-user.dto';
import * as admin from 'firebase-admin';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => AnnouncementsService))
    private readonly announcementService: AnnouncementsService,
    @Inject('FIREBASE_ADMIN')
    private readonly firebaseAdmin: typeof admin,
    private readonly mailService: MailService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserRequestDto): Promise<User> {
    // 🔒 Normalize email
    if (createUserDto?.email) {
      createUserDto.email = createUserDto.email.trim().toLowerCase();
    }

    // ✅ Idempotent create: return existing if present
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) return existing;

    return this.userRepo.save(createUserDto);
  }

  async createFirebaseUser(
    createFirebaseUserDto: CreateFirebaseUserDto,
  ): Promise<CreateUserResponseDto> {
    const email = createFirebaseUserDto.email.trim().toLowerCase();
    const { firstName, lastName } = createFirebaseUserDto;

    // Generate a one-time password (e.g., a 16-character hex string)
    const generatedPassword = require('crypto').randomBytes(8).toString('hex');

    try {
      // Create the user in Firebase Auth using the Admin SDK
      const firebaseUser = await this.firebaseAdmin.auth().createUser({
        email,
        password: generatedPassword,
        displayName: `${firstName} ${lastName}`,
      });

      // Prepare the DTO to create the user in your own DB.
      const newUserDto: CreateUserRequestDto = {
        email,
        firstName,
        lastName,
        firebaseId: firebaseUser.uid,
        authProvider: AuthProvider.EMAIL,
        role: 'user',
        phoneNumber: '',
        favourites: [],
      };

      // Insert (idempotent via create()).
      const newUser = await this.create(newUserDto);
      const displayName = `${newUser.firstName} ${newUser.lastName}`.trim();

      // Send an email with the login credentials.
      await this.mailService.sendUserCredentials(
        newUser.email,
        newUser.firstName,
        newUser.email, // assuming email is used as username
        generatedPassword,
      );

      // Return the newly created user record including the firebaseId.
      const responseDto: CreateUserResponseDto = {
        id: newUser.id,
        email: newUser.email,
        displayName,
        firebaseId: newUser.firebaseId,
        phoneNumber: newUser.phoneNumber,
      };

      return responseDto;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async getFavouriteAnnouncements(id: string) {
    const userById = await this.userRepo.findOne({ where: { id } });

    if (!userById?.favourites?.length) {
      return [];
    }

    const favAnnouncements = await Promise.all(
      userById.favourites.map((announcementId) =>
        this.announcementService.findOne(announcementId),
      ),
    );

    const validAnnouncements = favAnnouncements.filter(Boolean);

    // 🧼 Auto-clean invalid favorites
    const validIds = validAnnouncements.map((a) => a.id);
    if (validIds.length !== userById.favourites.length) {
      userById.favourites = validIds;
      await this.userRepo.save(userById);
    }

    return validAnnouncements;
  }

  findOneByFirebaseId(firebaseId: string) {
    return this.userRepo.findOne({
      where: { firebaseId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all announcements created by this user
    const announcementsByUser = await this.announcementService.findByUserId(id);
    for (const announcement of announcementsByUser) {
      await this.announcementService.remove(announcement.id);
    }

    // Delete the user from Firebase if applicable
    if (user.firebaseId) {
      try {
        await this.firebaseAdmin.auth().deleteUser(user.firebaseId);
      } catch (error) {
        console.error(
          `Failed to delete Firebase user with ID ${user.firebaseId}`,
          error,
        );
        throw new BadRequestException('Error deleting user from Firebase.');
      }
    }

    return this.userRepo.delete(id);
  }

  // ✅ Case-insensitive, trimmed lookup
  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== 'string') return null;
    const normalized = email.trim().toLowerCase();

    return this.userRepo.findOne({
      where: {
        email: Raw((alias) => `LOWER(${alias}) = :e`, { e: normalized }),
      },
    });
  }
}
