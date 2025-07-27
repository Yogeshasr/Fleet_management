
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'ABC Corporation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Manager' })
  @IsString()
  contactPerson: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'contact@abccorp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123 Business St, City, State 12345' })
  @IsString()
  address: string;
}
