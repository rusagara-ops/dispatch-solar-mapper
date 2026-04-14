import { Router } from 'express';
import { buildSitesListResponse } from '../services/siteList.js';
import { buildSiteDetailResponse } from '../services/siteDetail.js';
import { ErrorCodes } from '../types/errors.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sites = await buildSitesListResponse();
    res.json(sites);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'Failed to build site list',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await buildSiteDetailResponse(req.params.id);

    if (result.type === 'not_found') {
      return res.status(404).json({
        error: ErrorCodes.NOT_FOUND,
        message: 'Unknown site id',
      });
    }

    if (result.type === 'geocode_failed') {
      return res.status(422).json({
        error: result.error,
        message: result.message,
        site: result.site,
      });
    }

    res.json(result.detail);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'INTERNAL',
      message: err instanceof Error ? err.message : 'Failed to load site',
    });
  }
});

export default router;
