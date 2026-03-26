import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsString()
  username: string

  @IsEmail()
  email: string

  @IsString()
  firstname: string

  @IsString()
  lastname: string

  @IsString()
  @MinLength(8)
  password: string
}

export class LoginDto {
  @IsString()
  username: string

  @IsString()
  password: string
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string

  @IsString()
  @MinLength(8)
  newPassword: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(8)
  newPassword: string
}