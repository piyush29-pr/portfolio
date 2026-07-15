import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../lib/apiResponse';

export class AnalyticsController {
  async getDashboard(req: Request, res: Response) {
    const data = await analyticsService.getDashboardMetrics();
    sendSuccess(res, data);
  }
}

export const analyticsController = new AnalyticsController();
