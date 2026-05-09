import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Coffee } from './coffee.model';
import { CreateCoffeeDto } from './dto/create-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee)
    private readonly coffeeModel: typeof Coffee,
  ) {}

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const coffee = await this.coffeeModel.create({
      type: createCoffeeDto.type,
    });

    await this.triggerStatsSnapshot();

    return coffee;
  }

  async findAll(): Promise<Coffee[]> {
    return this.coffeeModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const deletedCount = await this.coffeeModel.destroy({
      where: { id },
    });

    if (!deletedCount) {
      throw new NotFoundException('Coffee not found');
    }

    return { deleted: true };
  }

  private async triggerStatsSnapshot(): Promise<void> {
    const fastApiBaseUrl =
      process.env.FASTAPI_BASE_URL ?? 'http://localhost:8000';

    try {
      await axios.post(`${fastApiBaseUrl}/stats/snapshot`);
      console.log('✅ FastAPI stats snapshot triggered');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn(
          `⚠️ FastAPI snapshot failed: ${error.code ?? 'NO_CODE'} - ${
            error.message
          }`,
        );
        return;
      }

      if (error instanceof Error) {
        console.warn(`⚠️ FastAPI snapshot failed: ${error.message}`);
        return;
      }

      console.warn('⚠️ FastAPI snapshot failed: Unknown error');
    }
  }
}
