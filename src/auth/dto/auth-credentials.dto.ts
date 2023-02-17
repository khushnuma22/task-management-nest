import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*w+))(?![.n])(?=.*[A-Z])(?=.*[a-z]).*s/, {
        message: 'Password is too weak',
    })
    password: string;
}