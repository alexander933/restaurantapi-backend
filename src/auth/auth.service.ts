import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.dto'
import { Request } from 'express'
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ─── REGISTER ───────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.users.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    })
    if (exists) throw new BadRequestException('Email o username ya en uso')

    const password_hash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.users.create({
      data: {
        username:  dto.username,
        email:     dto.email,
        firstname: dto.firstname,
        lastname:  dto.lastname,
        credentials: {
          create: { password_hash }
        },
        permissions: {
          create: {}
        },
      },
    })

    return { message: 'Usuario creado exitosamente', userId: user.id }
  }

  // ─── LOGIN ──────────────────────────────────────────────
  async login(dto: LoginDto, req: Request) {
    const ip     = req.ip
    const device = req.headers['user-agent'] ?? null

    const user = await this.prisma.users.findUnique({
      where:   { username: dto.username },
      include: { credentials: true },
    })

    if (!user || !user.active || !user.credentials) {
      if (user) {
        await this.prisma.users_logins.create({
          data: { user_id: user.id, ip_address: ip, device, successful: false },
        })
      }
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const isValid = await bcrypt.compare(dto.password, user.credentials.password_hash)

    await this.prisma.users_logins.create({
      data: { user_id: user.id, ip_address: ip, device, successful: isValid },
    })

    if (!isValid) throw new UnauthorizedException('Credenciales inválidas')

    const token = this.jwt.sign({ sub: user.id, email: user.email })
    return { access_token: token }
  }

  // ─── CHANGE PASSWORD ────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const credentials = await this.prisma.users_credentials.findUnique({
      where: { user_id: userId },
    })
    if (!credentials) throw new NotFoundException('Usuario no encontrado')

    const isValid = await bcrypt.compare(dto.currentPassword, credentials.password_hash)
    if (!isValid) throw new UnauthorizedException('Contraseña actual incorrecta')

    const password_hash = await bcrypt.hash(dto.newPassword, 12)

    await this.prisma.users_credentials.update({
      where: { user_id: userId },
      data:  { password_hash, last_password_change: new Date() },
    })

    return { message: 'Contraseña actualizada exitosamente' }
  }

  // ─── FORGOT PASSWORD ────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.users.findUnique({ where: { email: dto.email } })

    if (!user) return { message: 'Si el email existe, recibirás instrucciones' }

    const reset_token        = crypto.randomBytes(32).toString('hex')
    const reset_token_expiry = new Date(Date.now() + 1000 * 60 * 30)

    await this.prisma.users_credentials.update({
      where: { user_id: user.id },
      data:  { reset_token, reset_token_expiry },
    })

    console.log(`Token de reset para ${dto.email}: ${reset_token}`)

    return { message: 'Si el email existe, recibirás instrucciones' }
  }

  // ─── RESET PASSWORD ─────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const credentials = await this.prisma.users_credentials.findFirst({
      where: { reset_token: dto.token },
    })

    if (!credentials || !credentials.reset_token_expiry) {
      throw new BadRequestException('Token inválido')
    }

    if (credentials.reset_token_expiry < new Date()) {
      throw new BadRequestException('Token expirado')
    }

    const password_hash = await bcrypt.hash(dto.newPassword, 12)

    await this.prisma.users_credentials.update({
      where: { id: credentials.id },
      data: {
        password_hash,
        reset_token:          null,
        reset_token_expiry:   null,
        last_password_change: new Date(),
      },
    })

    return { message: 'Contraseña restablecida exitosamente' }
  }
}