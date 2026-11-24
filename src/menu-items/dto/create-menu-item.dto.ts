import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'price must be a positive number' })
  price: number;

  @IsInt()
  restaurantId: number;
}