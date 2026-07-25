import {
  Controller,
  Delete,
  Get,
  Inject,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { RegisterUserUseCase } from '../../../application/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/login-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/auth/get-current-user.use-case';
import { UpdateCurrentUserUseCase } from '../../../application/auth/update-current-user.use-case';
import { ChangePasswordUseCase } from '../../../application/auth/change-password.use-case';
import {
  AvatarService,
  type UploadedAvatar,
} from '../../../application/auth/avatar.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthUser } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUser: RegisterUserUseCase,
    @Inject(LoginUserUseCase)
    private readonly loginUser: LoginUserUseCase,
    @Inject(GetCurrentUserUseCase)
    private readonly getCurrentUser: GetCurrentUserUseCase,
    @Inject(UpdateCurrentUserUseCase)
    private readonly updateCurrentUser: UpdateCurrentUserUseCase,
    @Inject(ChangePasswordUseCase)
    private readonly changePassword: ChangePasswordUseCase,
    @Inject(AvatarService)
    private readonly avatars: AvatarService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUser.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUser.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.getCurrentUser.execute(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.updateCurrentUser.execute(user.id, {
      name: dto.name,
      email: dto.email,
      username: dto.username,
    });
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    }),
  )
  uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: UploadedAvatar | undefined,
  ) {
    return this.avatars.upload(user.id, file);
  }

  @Delete('me/avatar')
  @UseGuards(JwtAuthGuard)
  removeAvatar(@CurrentUser() user: AuthUser) {
    return this.avatars.remove(user.id);
  }

  @Get('me/avatar')
  @UseGuards(JwtAuthGuard)
  async getAvatar(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.avatars.getFile(user.id);
    response.set({
      'Content-Type': result.contentType,
      'Cache-Control': 'private, max-age=3600',
    });
    return new StreamableFile(createReadStream(result.absolutePath));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePasswordMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.changePassword.execute(user.id, {
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }
}
