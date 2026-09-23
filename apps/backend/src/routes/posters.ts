import { Router } from 'express';
import prisma from '../utils/prisma';
import { generatePoster } from '../services/generationService';

const router = Router();

router.post('/', async (req, res) => {
  const { name, designation, party, union, occasionType, headline, photoUrls, templateId } = req.body;

  try {
    // Basic validation
    if (!name || !designation || !headline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Lookup a user (or create a guest user if none exist)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Guest User',
          emailOrPhone: 'guest@example.com',
          passwordHash: 'dummy-hash'
        }
      });
    }

    // Lookup the template based on occasionType
    let template = await prisma.template.findFirst({
      where: { occasionType }
    });
    if (!template) {
      // fallback to first template
      template = await prisma.template.findFirst();
    }
    
    if (!template) {
       return res.status(500).json({ error: 'No templates configured in database' });
    }

    // Create the poster record with DRAFT status
    const poster = await prisma.poster.create({
      data: {
        userId: user.id,
        templateId: template.id,
        formData: { name, designation, party, union, occasionType, headline },
        uploadedPhotoUrls: photoUrls || [],
        status: 'GENERATING'
      }
    });

    // Start background generation (fire and forget)
    generatePoster(poster.id).catch(console.error);

    // Return the ID for polling
    res.status(202).json({ id: poster.id, status: 'GENERATING' });

  } catch (error) {
    console.error('Poster creation error:', error);
    res.status(500).json({ error: 'Failed to create poster request' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poster = await prisma.poster.findUnique({
      where: { id }
    });

    if (!poster) {
      return res.status(404).json({ error: 'Poster not found' });
    }

    res.json(poster);
  } catch (error) {
    console.error('Fetch poster error:', error);
    res.status(500).json({ error: 'Failed to fetch poster' });
  }
});

export default router;
