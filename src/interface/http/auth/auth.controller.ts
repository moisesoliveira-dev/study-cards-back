import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/auth/login-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/auth/get-current-user.use-case';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthUser } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUser: RegisterUserUseCase,
    @Inject(LoginUserUseCase)
    private readonly loginUser: LoginUserUseCase,
    @Inject(GetCurrentUserUseCase)
    private readonly getCurrentUser: GetCurrentUserUseCase,
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
}
