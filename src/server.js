const express = require('express');
const NZSpellingConverter = require('./services/converter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const converter = new NZSpellingConverter();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', initialized: converter.initialized });
});

app.post('/convert', async (req, res) => {
  try {
    const { text, data } = req.body;

    if (!text && !data) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either "text" (string) or "data" (object/array) is required',
      });
    }

    if (text !== undefined) {
      if (typeof text !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: '"text" must be a string',
        });
      }

      const converted = await converter.convert(text);
      return res.json({ converted });
    }

    const converted = await converter.convertObject(data);
    return res.json({ converted });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to convert text',
    });
  }
});

app.post('/mappings', async (req, res) => {
  try {
    const { mappings } = req.body;

    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '"mappings" must be an object with from-to word pairs',
      });
    }

    for (const [from, to] of Object.entries(mappings)) {
      if (typeof from !== 'string' || typeof to !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'All mapping keys and values must be strings',
        });
      }
      converter.addCustomMapping(from, to);
    }

    res.json({
      message: 'Custom mappings added successfully',
      mappings: converter.getCustomMappings(),
    });
  } catch (error) {
    console.error('Mapping error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add custom mappings',
    });
  }
});

app.get('/mappings', (req, res) => {
  try {
    const mappings = converter.getCustomMappings();
    res.json({ mappings });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve custom mappings',
    });
  }
});

app.delete('/mappings/:word', (req, res) => {
  try {
    const { word } = req.params;
    converter.removeCustomMapping(word);
    res.json({
      message: `Mapping for "${word}" removed successfully`,
      mappings: converter.getCustomMappings(),
    });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove custom mapping',
    });
  }
});

app.delete('/mappings', (req, res) => {
  try {
    converter.clearCustomMappings();
    res.json({
      message: 'All custom mappings cleared successfully',
      mappings: {},
    });
  } catch (error) {
    console.error('Clear mappings error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to clear custom mappings',
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
