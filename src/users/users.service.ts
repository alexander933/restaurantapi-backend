import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los usuarios
  async findAll() {
    return this.prisma.users.findMany({
      include: {
        permissions: true,
      }
    });
  }

  // ← ¿Tienes este método?
  async findOne(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        permissions: true,
        credentials: true,
      }
    });
  }

  // Crear usuario
  async create(data: any) {
    return this.prisma.users.create({
      data: {
        username: data.username,
        email: data.email,
        firstname : data.firstname ,
        lastname : data.lastname ,
        rol: data.rol,
        credentials: {
          create: {
            password_hash: data.password
          }
        },
        permissions: {
          create: {
            can_read: true,
            can_create: false,
            can_update: false,
            can_delete: false,
          }
        }
      }
    });
  }

  // ← ¿Tienes este método?
 async remove(id: string) {
  return this.prisma.$transaction([
    this.prisma.users_logins.deleteMany({ where: { user_id: id } }),
    this.prisma.users_permissions.deleteMany({ where: { user_id: id } }),
    this.prisma.users_credentials.deleteMany({ where: { user_id: id } }),
    this.prisma.users.delete({ where: { id } }),
  ]);
 }
}
