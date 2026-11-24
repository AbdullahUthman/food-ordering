import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
  ) {}

  findAll() {
    return this.restaurantRepo.find({ relations: ['menuItems'] });
  }

  create(dto: CreateRestaurantDto) {
    const restaurant = this.restaurantRepo.create(dto);
    return this.restaurantRepo.save(restaurant);
  }
}