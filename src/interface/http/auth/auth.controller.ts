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
import { ConfirmRegistrationUseCase } from '../../../application/auth/confirm-registration.use-case';
import { ResendVerificationCodeUseCase } from '../../../application/auth/resend-verification-code.use-case';
import { LoginUserUseCase } from '../../../application/auth/login-user.use-case';
import { ForgotPasswordUseCase } from '../../../application/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/auth/reset-password.use-case';
import { GetCurrentUserUseCase } from '../../../application/auth/get-current-user.use-case';
import { UpdateCurrentUserUseCase } from '../../../application/auth/update-current-user.use-case';
import { ChangePasswordUseCase } from '../../../application/auth/change-password.use-case';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthUser } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendCodeDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyEmailDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUser: RegisterUserUseCase,
    @Inject(ConfirmRegistrationUseCase)
    private readonly confirmRegistration: ConfirmRegistrationUseCase,
    @Inject(ResendVerificationCodeUseCase)
    private readonly resendVerificationCode: ResendVerificationCodeUseCase,
    @Inject(LoginUserUseCase)
    private readonly loginUser: LoginUserUseCase,
    @Inject(ForgotPasswordUseCase)
    private readonly forgotPassword: ForgotPasswordUseCase,
    @Inject(ResetPasswordUseCase)
    private readonly resetPassword: ResetPasswordUseCase,
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

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.confirmRegistration.execute(dto);
  }

  @Post('resend-code')
  resendCode(@Body() dto: ResendCodeDto) {
    return this.resendVerificationCode.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUser.execute(dto);
  }

  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.forgotPassword.execute(dto);
  }

  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.resetPassword.execute(dto);
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
