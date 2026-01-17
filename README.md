# NZ Spelling Converter API - User Guide

A REST API service that automatically converts American and British English text to New Zealand English spelling conventions.

**Live API:** https://convert.marketingtech.pro

## Table of Contents

- [What Does This Do?](#what-does-this-do)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Common Use Cases](#common-use-cases)
- [Corrections](#corrections)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## What Does This Do?

This API automatically converts text to New Zealand English spelling. It handles:

- **American to NZ spelling**: "color" → "colour", "organize" → "organise"
- **-ize to -ise conversions**: "customize" → "customise", "realize" → "realise"
- **Phrase replacements**: "zip code" → "postcode"
- **Case preservation**: "COLOR" → "COLOUR", "Color" → "Colour"
- **Complex JSON objects**: Converts all text strings in nested data structures
- **Post-translation corrections**: Add your own NZ-specific terms and fix archaic spellings

### Examples of Conversions

| American/British | New Zealand |
|-----------------|-------------|
| color | colour |
| organize | organise |
| analyze | analyse |
| aluminum | aluminium |
| recognize | recognise |
| zip code | postcode |
| datacenter* | data centre* |

*Custom correction example

## Quick Start

### Option 1: Docker (Easiest)

```bash
# Start the server
docker-compose up -d

# The API is now running at https://convert.marketingtech.pro
```

### Option 2: Node.js

```bash
# Install dependencies
npm install

# Start the server
npm start

# The API is now running at https://convert.marketingtech.pro
```

### Test It Works

```bash
# Check the server is running
curl https://convert.marketingtech.pro/health

# Get API documentation
curl https://convert.marketingtech.pro/help

# Try a conversion
curl -X POST https://convert.marketingtech.pro/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "The organization will analyze the color data."}'

# You should see:
# {"converted": "The organisation will analyse the colour data."}
```

## Installation

### Prerequisites

Choose one:
- **Docker** (recommended): Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Node.js**: Install [Node.js 20+](https://nodejs.org/)

### Docker Installation

1. Clone or download this repository
2. Navigate to the project folder
3. Run:
   ```bash
   docker-compose up -d
   ```
4. The API will be available at `https://convert.marketingtech.pro`

### Node.js Installation

1. Clone or download this repository
2. Navigate to the project folder
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. The API will be available at `https://convert.marketingtech.pro`

### Verify Installation

```bash
curl https://convert.marketingtech.pro/health
```

You should see: `{"status":"ok","initialized":true}`

## API Reference

### Base URL

```
https://convert.marketingtech.pro
```

For local development: `https://convert.marketingtech.pro`

### Endpoints

#### 1. Health Check

```http
GET /health
```

Check if the server is running and initialized.

**Response:**
```json
{
  "status": "ok",
  "initialized": true
}
```

#### 2. API Documentation

```http
GET /help
```

Get API documentation with all available endpoints and examples.

**Response:**
```json
{
  "name": "NZ Spelling Converter API",
  "description": "Converts American/British English to New Zealand English spelling",
  "endpoints": { ... },
  "pipeline": [ ... ],
  "notes": [ ... ]
}
```

#### 3. Convert Text

```http
POST /convert
```

Convert a text string to NZ spelling.

**Request:**
```json
{
  "text": "The organization analyzed the color of the aluminum."
}
```

**Response:**
```json
{
  "converted": "The organisation analysed the colour of the aluminium."
}
```

#### 4. Convert JSON Data

```http
POST /convert
```

Convert all strings in a JSON object or array.

**Request:**
```json
{
  "data": {
    "title": "Color Analysis Report",
    "description": "We will analyze and optimize the colors",
    "tags": ["organize", "customize", "finalize"]
  }
}
```

**Response:**
```json
{
  "converted": {
    "title": "Colour Analysis Report",
    "description": "We will analyse and optimise the colours",
    "tags": ["organise", "customise", "finalise"]
  }
}
```

#### 5. Add Corrections

```http
POST /corrections
```

Add post-translation corrections (persisted to disk).

**Request:**
```json
{
  "corrections": {
    "cellphone": "mobile phone",
    "apartment": "flat",
    "sidewalk": "footpath"
  }
}
```

**Response:**
```json
{
  "message": "Corrections added successfully",
  "corrections": {
    "philtre": "filter",
    "connexion": "connection",
    "cellphone": "mobile phone",
    "apartment": "flat",
    "sidewalk": "footpath"
  }
}
```

#### 6. Get Corrections

```http
GET /corrections
```

Retrieve all active corrections.

**Response:**
```json
{
  "corrections": {
    "philtre": "filter",
    "connexion": "connection",
    "sidewalk": "footpath"
  }
}
```

#### 7. Delete a Correction

```http
DELETE /corrections/:word
```

Remove a specific correction.

**Example:**
```bash
curl -X DELETE https://convert.marketingtech.pro/corrections/sidewalk
```

**Response:**
```json
{
  "message": "Correction for \"sidewalk\" removed successfully",
  "corrections": {
    "philtre": "filter",
    "connexion": "connection"
  }
}
```

#### 8. Clear All Corrections

```http
DELETE /corrections
```

Remove all corrections.

**Response:**
```json
{
  "message": "All corrections cleared successfully",
  "corrections": {}
}
```

## Usage Examples

### Command Line (cURL)

#### Convert simple text

```bash
curl -X POST https://convert.marketingtech.pro/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "Please organize the color samples and analyze the results."}'
```

#### Convert a JSON file

```bash
curl -X POST https://convert.marketingtech.pro/convert \
  -H "Content-Type: application/json" \
  -d @myfile.json
```

#### Add custom words

```bash
curl -X POST https://convert.marketingtech.pro/corrections \
  -H "Content-Type: application/json" \
  -d '{"corrections": {"internet": "Internet", "wifi": "Wi-Fi"}}'
```

### JavaScript / Node.js

```javascript
// Simple text conversion
async function convertText(text) {
  const response = await fetch('https://convert.marketingtech.pro/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const { converted } = await response.json();
  return converted;
}

const result = await convertText('The organization will analyze the color data.');
console.log(result);
// "The organisation will analyse the colour data."
```

```javascript
// Convert a complex object
async function convertObject(data) {
  const response = await fetch('https://convert.marketingtech.pro/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  const { converted } = await response.json();
  return converted;
}

const myData = {
  title: "Color Report",
  sections: [
    { heading: "Analyze Colors", content: "We need to organize..." },
    { heading: "Optimize Results", content: "The organization will..." }
  ]
};

const converted = await convertObject(myData);
console.log(converted);
```

### Python

```python
import requests
import json

# Convert text
def convert_text(text):
    response = requests.post(
        'https://convert.marketingtech.pro/convert',
        json={'text': text}
    )
    return response.json()['converted']

result = convert_text('The organization analyzed the color data.')
print(result)
# "The organisation analysed the colour data."
```

```python
# Convert a dictionary
def convert_data(data):
    response = requests.post(
        'https://convert.marketingtech.pro/convert',
        json={'data': data}
    )
    return response.json()['converted']

my_data = {
    'title': 'Color Analysis',
    'description': 'We will organize and analyze the colors'
}

result = convert_data(my_data)
print(result)
```

### PHP

```php
<?php
function convertText($text) {
    $ch = curl_init('https://convert.marketingtech.pro/convert');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['text' => $text]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true)['converted'];
}

$result = convertText('The organization analyzed the color data.');
echo $result;
// "The organisation analysed the colour data."
?>
```

### Ruby

```ruby
require 'net/http'
require 'json'

def convert_text(text)
  uri = URI('https://convert.marketingtech.pro/convert')
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.path, {'Content-Type' => 'application/json'})
  request.body = {text: text}.to_json

  response = http.request(request)
  JSON.parse(response.body)['converted']
end

result = convert_text('The organization analyzed the color data.')
puts result
# "The organisation analysed the colour data."
```

## Common Use Cases

### 1. CMS / Blog Platform

Convert all content before publishing to ensure consistent NZ spelling.

```javascript
// Before saving a blog post
async function savePost(post) {
  const convertedPost = await fetch('https://convert.marketingtech.pro/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: post })
  }).then(r => r.json());

  // Save convertedPost.converted to database
  await db.posts.save(convertedPost.converted);
}
```

### 2. API Response Transformation

Convert API responses before sending to NZ clients.

```javascript
// Express middleware
app.use(async (req, res, next) => {
  const originalSend = res.json;

  res.json = async function(data) {
    if (req.headers['accept-language']?.includes('en-NZ')) {
      const response = await fetch('https://convert.marketingtech.pro/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      const { converted } = await response.json();
      return originalSend.call(this, converted);
    }
    return originalSend.call(this, data);
  };

  next();
});
```

### 3. Batch File Processing

Convert multiple documents or files.

```javascript
const fs = require('fs').promises;
const path = require('path');

async function convertDirectory(dirPath) {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    if (path.extname(file) === '.json') {
      const content = await fs.readFile(path.join(dirPath, file), 'utf8');
      const data = JSON.parse(content);

      const response = await fetch('https://convert.marketingtech.pro/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      const { converted } = await response.json();

      await fs.writeFile(
        path.join(dirPath, file.replace('.json', '-nz.json')),
        JSON.stringify(converted, null, 2)
      );
    }
  }
}

convertDirectory('./content').then(() => console.log('Done!'));
```

### 4. Email Template Conversion

Convert email templates for NZ audience.

```javascript
async function sendNZEmail(recipient, template) {
  // Convert template to NZ spelling
  const response = await fetch('https://convert.marketingtech.pro/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: template })
  });

  const { converted } = await response.json();

  // Send email with converted template
  await emailService.send({
    to: recipient,
    subject: converted.subject,
    body: converted.body
  });
}
```

## Corrections

Corrections are post-translation fixes applied after the main US→UK conversion. Use them to fix archaic spellings, add NZ-specific terms, or override unwanted translations.

### When to Use Corrections

1. **Fix archaic spellings**: "philtre" → "filter", "connexion" → "connection"
2. **NZ-specific terms**: "sidewalk" → "footpath", "zip code" → "postcode"
3. **Industry-specific terms**: "datacenter" → "data centre"
4. **Currency symbols**: Restore $ if translator changes to £

### Adding Corrections

```bash
curl -X POST https://convert.marketingtech.pro/corrections \
  -H "Content-Type: application/json" \
  -d '{
    "corrections": {
      "cellphone": "mobile phone",
      "apartment": "flat",
      "sidewalk": "footpath"
    }
  }'
```

### Managing Corrections

```bash
# View all corrections
curl https://convert.marketingtech.pro/corrections

# Remove a specific correction
curl -X DELETE https://convert.marketingtech.pro/corrections/cellphone

# Clear all corrections
curl -X DELETE https://convert.marketingtech.pro/corrections
```

### Corrections Are Persistent

Corrections are saved to `/opt/nz-spelling-converter/src/data/corrections.json` and persist across server restarts and container rebuilds (via volume mount in docker-compose.yml).

## How It Works

The converter applies transformations in this order:

1. **Normalize special characters**: Em-dashes and currency symbols ($ protected during translation)
2. **Main translation**: American → British using external library ("color" → "colour", "center" → "centre")
3. **Apply corrections**: Fix archaic spellings and add NZ-specific terms (post-translation)
4. **-ize to -ise conversion**: Using dictionary validation to ensure accuracy

### Built-in Features

- **Dictionary validation**: Only converts words found in US and GB dictionaries
- **Case preservation**: "COLOR" → "COLOUR", "Color" → "Colour", "color" → "colour"
- **Phrase handling**: Multi-word phrases like "zip code" → "postcode"
- **Deep object traversal**: Converts all strings in nested JSON structures

### What Gets Converted

- Individual words: "organize" → "organise"
- Phrases: "zip code" → "postcode"
- All strings in JSON objects and arrays
- Preserves numbers, booleans, null values

### What Doesn't Get Converted

- Non-string values (numbers, booleans, null)
- Object keys (only values are converted)
- Words not in the dictionaries
- Words that match correction keys (these are replaced with correction values instead)

## Deployment

### Docker Production Deployment

#### 1. Build the Image

```bash
docker build -t nz-spelling-converter .
```

#### 2. Run the Container

```bash
docker run -d \
  --name nz-spelling-converter \
  -p 3000:3000 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  nz-spelling-converter
```

#### 3. Using Docker Compose

```bash
docker-compose up -d
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=production
```

Update `docker-compose.yml`:

```yaml
services:
  nz-spelling-converter:
    build: .
    env_file:
      - .env
    ports:
      - "${PORT}:${PORT}"
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name spelling.example.com;

    location / {
        proxy_pass https://convert.marketingtech.pro;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Health Checks

The `/health` endpoint can be used for:

- Docker healthchecks
- Load balancer health monitoring
- Kubernetes liveness/readiness probes

```yaml
# docker-compose.yml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "https://convert.marketingtech.pro/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Server Won't Start

**Problem**: Port already in use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change the port

```bash
# Option 1: Set PORT environment variable
PORT=3001 npm start

# Option 2: Update docker-compose.yml
ports:
  - "3001:3000"
```

### Docker Issues

**Problem**: Container won't start

```bash
# Check logs
docker-compose logs -f

# Restart container
docker-compose restart

# Rebuild container
docker-compose up -d --build
```

**Problem**: Cannot connect to API

```bash
# Check if container is running
docker ps

# Check if port is mapped correctly
docker port nz-spelling-converter
```

### Conversion Not Working

**Problem**: Some words not converting

- Check if the word is in the US/GB dictionaries
- The converter only converts words it can validate
- Add corrections for specific words

**Problem**: Corrections not applying

```bash
# Check if corrections were added
curl https://convert.marketingtech.pro/corrections

# Re-add corrections
curl -X POST https://convert.marketingtech.pro/corrections \
  -H "Content-Type: application/json" \
  -d '{"corrections": {"word": "replacement"}}'
```

### Performance Issues

**Problem**: Slow conversion for large files

- The converter processes all strings recursively
- For very large JSON objects, consider breaking them into smaller chunks
- Use streaming for large datasets

## FAQ

### Q: Does this work offline?

Yes, once the dictionaries are loaded at startup, the API works completely offline.

### Q: Can I use this for commercial projects?

Yes, this is licensed under ISC.

### Q: How accurate is the conversion?

The converter uses official US and GB dictionaries and only converts words it can validate. It's designed to be conservative - if unsure, it won't convert.

### Q: Can I customize which words get converted?

Yes, use corrections via the `/corrections` endpoint. Corrections are applied post-translation to fix unwanted conversions or add NZ-specific terms.

### Q: Does it preserve formatting?

Yes, it preserves:
- Case (UPPER, Title, lower)
- JSON structure
- Numbers and non-string values

### Q: What about New Zealand-specific words?

The converter uses British English (UK) dictionaries as the base for NZ spelling, which is the standard practice. For NZ-specific terms (like "footpath" instead of "pavement"), add corrections.

### Q: Can I convert HTML?

The API converts text strings. For HTML, you'd need to parse it first, extract text nodes, convert them, and reconstruct the HTML.

### Q: Is there a rate limit?

No built-in rate limiting. Add rate limiting via reverse proxy if needed.

### Q: Can multiple clients share corrections?

Yes, corrections are global to the server instance and persisted to disk. All clients share the same corrections. For per-client corrections, deploy separate instances.

### Q: How do I update the dictionaries?

Dictionaries are from npm packages. To update:

```bash
npm update @cspell/dict-en_us @cspell/dict-en-gb-ise
docker-compose up -d --build
```

## Support

For issues, feature requests, or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [FAQ](#faq)
3. Submit an issue on GitHub

## License

ISC
