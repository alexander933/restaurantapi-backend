import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly users = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@restaurante.com',
      password: '123456',
    },
    {
      id: '2',
      username: 'mesero',
      email: 'mesero@restaurante.com',
      password: 'mesero123',
    },
  ];

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    
    // 🔍 DEBUG
    console.log('========== DEBUG LOGIN ==========');
    console.log('Identifier recibido:', identifier);
    console.log('Password recibido:', password);
    console.log('Tipo de identifier:', typeof identifier);
    console.log('Tipo de password:', typeof password);
    console.log('Usuarios disponibles:', this.users);
    
    const user = this.users.find(
      (u) => (u.email === identifier || u.username === identifier) && u.password === password,
    );
    
    console.log('Usuario encontrado:', user);
    console.log('=================================');
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token: 'fake-jwt-token-' + user.id,
    };
  }
}