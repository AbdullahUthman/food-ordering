import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menu-items/menu-items.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'YOUR_PASSWORD',
      database: 'food_ordering',
      autoLoadEntities: true,
      synchronize: true, // auto-creates tables (fine for an assignment)
    }),
    RestaurantsModule,
    MenuItemsModule,
  ],
})
export class AppModule {}