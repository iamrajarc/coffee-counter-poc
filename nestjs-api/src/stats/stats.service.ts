import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

export interface StatsSummary {
  total: number;
  today: number;
  favourite: string;
}

@Injectable()
export class StatsService {
  async getSummary(): Promise<StatsSummary> {
    const fastApiBaseUrl =
      process.env.FASTAPI_BASE_URL ?? 'http://localhost:8000';

    try {
      const response = await axios.get<StatsSummary>(
        `${fastApiBaseUrl}/stats/summary`,
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn(
          `FastAPI stats summary failed: ${error.code ?? 'NO_CODE'} - ${
            error.message
          }`,
        );
      }

      throw new ServiceUnavailableException('Stats service is not available');
    }
  }
}
