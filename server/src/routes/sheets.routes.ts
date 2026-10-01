import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.ts';
import {
  getAllSheetIntegrations,
  getSheetIntegrationById,
  saveSheetIntegration,
  deleteSheetIntegration,
  testGoogleSheetConnection,
  syncGoogleSheetData,
  handleSheetWebhook,
  pullMemberDataFromSheet,
  pushMemberDataToSheet,
  getSheetGrowthTrends,
} from '../services/sheets.service.ts';

export const sheetsRouter = Router();

// ==========================================
// Public Webhook Ingestion Route (Protected by Secret Token)
// ==========================================
sheetsRouter.post('/webhook/:tenantId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { tenantId } = req.params;
    const secretHeader = req.header('X-GymOS-Webhook-Secret') || req.body.secretToken;
    const result = await handleSheetWebhook(tenantId, req.body, secretHeader);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Webhook processing failed.' });
  }
});

// Middleware for permissive token handling (supports both live JWT and demo sandbox fallback)
sheetsRouter.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }
  // Fallback demo user context so demo/preview never 401s
  req.user = {
    userId: 'usr-demo-001',
    tenantId: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
    email: 'admin@apexfit.com',
    fullName: 'Demo Admin',
    permissions: ['*'],
  };
  next();
});

/**
 * GET /api/integrations/sheets/trends
 * Growth trends derived from data synced with Google Sheets.
 */
sheetsRouter.get('/trends', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sheetId = req.query.sheetId as string | undefined;
    const trends = await getSheetGrowthTrends(sheetId);
    res.json({
      success: true,
      data: trends,
    });
  } catch (err: any) {
    next(err);
  }
});

/**
 * POST /api/integrations/sheets/pull
 * Pull member data updates from Google Sheet into GymOS database.
 */
sheetsRouter.post('/pull', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, tenantId } = req.body;
    const tid = tenantId || req.user?.tenantId || '11111111-1111-1111-1111-111111111111';
    const result = await pullMemberDataFromSheet(id, tid);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to pull data from Google Sheet.' });
  }
});

/**
 * POST /api/integrations/sheets/push
 * Push member data updates from GymOS database to Google Sheet.
 */
sheetsRouter.post('/push', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, tenantId, members } = req.body;
    const tid = tenantId || req.user?.tenantId || '11111111-1111-1111-1111-111111111111';
    const result = await pushMemberDataToSheet(id, tid, members);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to push data to Google Sheet.' });
  }
});

/**
 * GET /api/integrations/sheets
 * List all configured Google Sheet integrations.
 */
sheetsRouter.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getAllSheetIntegrations();
    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/integrations/sheets/:id
 * Retrieve a specific Google Sheet integration.
 */
sheetsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await getSheetIntegrationById(id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Google Sheet integration not found.' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/integrations/sheets/test
 * Test connection to Google Sheet with URL or ID.
 */
sheetsRouter.post('/test', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { spreadsheetIdOrUrl, accessToken, apiKey } = req.body;
    if (!spreadsheetIdOrUrl) {
      res.status(400).json({ success: false, error: 'spreadsheetIdOrUrl is required.' });
      return;
    }

    const result = await testGoogleSheetConnection({
      spreadsheetIdOrUrl,
      accessToken,
      apiKey,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/integrations/sheets
 * Create / register a new Google Sheet integration for a tenant.
 */
sheetsRouter.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sheetTitle, spreadsheetId, sheetUrl, tenantId } = req.body;
    if (!sheetTitle || (!spreadsheetId && !sheetUrl) || !tenantId) {
      res.status(400).json({
        success: false,
        error: 'sheetTitle, tenantId, and spreadsheetId (or sheetUrl) are required.',
      });
      return;
    }

    const saved = await saveSheetIntegration(req.body);
    res.status(201).json({
      success: true,
      message: `Google Sheet "${saved.sheetTitle}" linked successfully for tenant "${saved.tenantName}".`,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/integrations/sheets/:id
 * Update an existing Google Sheet integration.
 */
sheetsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await getSheetIntegrationById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Google Sheet integration not found.' });
      return;
    }

    const updated = await saveSheetIntegration({ ...req.body, id });
    res.json({
      success: true,
      message: `Google Sheet configuration updated for "${updated.sheetTitle}".`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/integrations/sheets/sync
 * Manually trigger data synchronization for an integration.
 */
sheetsRouter.post('/sync', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ success: false, error: 'Integration ID (id) is required to trigger sync.' });
      return;
    }

    const result = await syncGoogleSheetData(id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Sync failed.' });
  }
});

/**
 * DELETE /api/integrations/sheets/:id
 * Unlink and delete a Google Sheet integration.
 */
sheetsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await deleteSheetIntegration(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Integration not found or already deleted.' });
      return;
    }

    res.json({
      success: true,
      message: 'Google Sheet integration unlinked successfully.',
    });
  } catch (err) {
    next(err);
  }
});
