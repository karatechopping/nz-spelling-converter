const express = require('express');
const NZSpellingConverter = require('./services/converter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const converter = new NZSpellingConverter();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', initialized: converter.initialized });
});

app.get('/help', (req, res) => {
  res.json({
    name: 'NZ Spelling Converter API',
    description: 'Converts American/British English to New Zealand English spelling',
    endpoints: {
      'GET /health': {
        description: 'Health check endpoint',
        example: 'curl https://convert.marketingtech.pro/health'
      },
      'GET /help': {
        description: 'This help documentation',
        example: 'curl https://convert.marketingtech.pro/help'
      },
      'POST /convert': {
        description: 'Convert text or JSON data to NZ spelling',
        parameters: {
          text: 'String to convert (optional)',
          data: 'Object or array to convert (optional)',
          html: 'Boolean flag to enable HTML mode - protects HTML tags and entities (optional, default: false)'
        },
        examples: {
          text: 'curl -X POST https://convert.marketingtech.pro/convert -H "Content-Type: application/json" -d \'{"text": "The organization analyzed the color data."}\'',
          data: 'curl -X POST https://convert.marketingtech.pro/convert -H "Content-Type: application/json" -d \'{"data": {"title": "Color Report", "tags": ["organize", "analyze"]}}\'',
          html: 'curl -X POST https://convert.marketingtech.pro/convert -H "Content-Type: application/json" -d \'{"text": "<p>The organization analyzed the color data.</p>", "html": true}\''
        }
      },
      'GET /corrections': {
        description: 'View all active post-translation corrections',
        example: 'curl https://convert.marketingtech.pro/corrections'
      },
      'POST /corrections': {
        description: 'Add or update post-translation corrections (persisted to disk)',
        example: 'curl -X POST https://convert.marketingtech.pro/corrections -H "Content-Type: application/json" -d \'{"corrections": {"cellphone": "mobile phone", "apartment": "flat"}}\''
      },
      'DELETE /corrections/:word': {
        description: 'Remove a specific correction',
        example: 'curl -X DELETE https://convert.marketingtech.pro/corrections/cellphone'
      },
      'DELETE /corrections': {
        description: 'Clear all corrections',
        example: 'curl -X DELETE https://convert.marketingtech.pro/corrections'
      }
    },
    pipeline: [
      '1. Normalize special characters (em-dash, currency)',
      '2. Main translation (US → UK English)',
      '3. Apply corrections (fix archaic spellings, NZ-specific terms)',
      '4. Convert -ize to -ise'
    ],
    notes: [
      'Corrections are applied AFTER main translation',
      'Use corrections to fix archaic forms (philtre→filter, connexion→connection)',
      'Use corrections for NZ-specific terms (sidewalk→footpath, zip code→postcode)',
      'All corrections are persisted and survive server restarts',
      'HTML mode protects tags (<div>, <p>, etc.) and entities (&#8217;, &nbsp;, etc.) from conversion',
      'Use HTML mode when converting HTML content to preserve markup structure'
    ]
  });
});

app.post('/convert', async (req, res) => {
  try {
    const { text, data, html } = req.body;

    if (!text && !data) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either "text" (string) or "data" (object/array) is required',
      });
    }

    const isHtmlMode = html === true;

    if (text !== undefined) {
      if (typeof text !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: '"text" must be a string',
        });
      }

      const converted = isHtmlMode
        ? await converter.convertHtml(text)
        : await converter.convert(text);
      return res.json({ converted });
    }

    const converted = isHtmlMode
      ? await converter.convertObjectHtml(data)
      : await converter.convertObject(data);
    return res.json({ converted });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to convert text',
    });
  }
});

app.post('/corrections', async (req, res) => {
  try {
    const { corrections } = req.body;

    if (!corrections || typeof corrections !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '"corrections" must be an object with from-to word pairs',
      });
    }

    for (const [from, to] of Object.entries(corrections)) {
      if (typeof from !== 'string' || typeof to !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'All correction keys and values must be strings',
        });
      }
    }

    await converter.addCorrections(corrections);

    res.json({
      message: 'Corrections added successfully',
      corrections: converter.getCorrections(),
    });
  } catch (error) {
    console.error('Correction error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add corrections',
    });
  }
});

app.get('/corrections', (req, res) => {
  try {
    const corrections = converter.getCorrections();
    res.json({ corrections });
  } catch (error) {
    console.error('Get corrections error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve corrections',
    });
  }
});

app.delete('/corrections/:word', async (req, res) => {
  try {
    const { word } = req.params;
    await converter.removeCorrection(word);
    res.json({
      message: `Correction for "${word}" removed successfully`,
      corrections: converter.getCorrections(),
    });
  } catch (error) {
    console.error('Delete correction error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove correction',
    });
  }
});

app.delete('/corrections', async (req, res) => {
  try {
    await converter.clearCorrections();
    res.json({
      message: 'All corrections cleared successfully',
      corrections: {},
    });
  } catch (error) {
    console.error('Clear corrections error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to clear corrections',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
});

async function startServer() {
  try {
    console.log('Initializing NZ Spelling Converter...');
    await converter.initialize();
    console.log('Converter initialized successfully');

    app.listen(PORT, () => {
      console.log(`NZ Spelling Converter API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
