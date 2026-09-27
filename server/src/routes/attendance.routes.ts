import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requirePermission } from '../middleware/auth.ts';
import { enforceTenant } from '../middleware/tenant.ts';
import * as attendanceService from '../services/attendance.service.ts';

export const attendanceRouter = Router();

attendanceRouter.use(authenticateToken);
attendanceRouter.use(enforceTenant);

// GET /api/attendance
attendanceRouter.get('/', requirePermission('attendance:scan'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId;
    const records = await attendanceService.getAttendance(tenantId);
    res.json({ attendance: records, count: records.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/attendance/check-in
attendanceRouter.post('/check-in', requirePermission('attendance:scan'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user!.tenantId!;
    const { memberId, deviceId, method } = req.body;
    if (!memberId) {
      res.status(400).json({ error: 'memberId is required for check-in.' });
      return;
    }
    const checkin = await attendanceService.recordCheckIn(tenantId, memberId, deviceId, method);
    res.status(201).json({ message: 'Turnstile check-in verified', checkin });
  } catch (err) {
    next(err);
  }
});
