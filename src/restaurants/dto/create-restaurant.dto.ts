import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  address?: string;
}