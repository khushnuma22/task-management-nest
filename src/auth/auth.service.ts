import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) { }

    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentialsDto;

        //hash 
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({ username, password: hashedPassword });
        try {
            await this.userRepository.save(user);
        }
        catch (error) {
            if (error.code === '23505') {//duplicate username
                throw new ConflictException('Username already exists');
            }
            else {
                throw new InternalServerErrorException();
            }
        }

    }

    async singUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.createUser(authCredentialsDto)
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const { username, password } = authCredentialsDto;
        const user = await this.userRepository.findOneBy({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload: JwtPayload = { username };
            const accessToken: string = await this.jwtService.sign(payload)
            return { accessToken };
        }
        else {
            throw new UnauthorizedException('Please Check your login credentials');
        }
    }
}
