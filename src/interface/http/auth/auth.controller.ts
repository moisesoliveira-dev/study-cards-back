import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/login-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/auth/get-current-user.use-case';
import { UpdateCurrentUserUseCase } from '../../../application/auth/update-current-user.use-case';
import { ChangePasswordUseCase } from '../../../application/auth/change-password.use-case';
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
    });
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
