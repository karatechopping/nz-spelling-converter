# NZ Spelling Converter API - User Guide

A REST API service that automatically converts American and British English text to New Zealand English spelling conventions.

## Table of Contents

- [What Does This Do?](#what-does-this-do)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Common Use Cases](#common-use-cases)
- [Custom Mappings](#custom-mappings)
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
- **Custom mappings**: Add your own domain-specific conversions

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

*Custom mapping example

## Quick Start

### Option 1: Docker (Easiest)

```bash
# Start the server
docker-compose up -d

# The API is now running at http://localhost:3000
```

### Option 2: Node.js

```bash
# Install dependencies
npm install

# Start the server
npm start

# The API is now running at http://localhost:3000
```

### Test It Works

```bash
# Check the server is running
curl http://localhost:3000/health

# Try a conversion
curl -X POST http://localhost:3000/convert \
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
4. The API will be available at `http://localhost:3000`

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
5. The API will be available at `http://localhost:3000`

### Verify Installation

```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok","initialized":true}`

## API Reference

### Base URL

```
http://localhost:3000
```

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

#### 2. Convert Text

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

#### 3. Convert JSON Data

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

#### 4. Add Custom Mappings

```http
POST /mappings
```

Add custom word conversions.

**Request:**
```json
{
  "mappings": {
    "datacenter": "data centre",
    "email": "e-mail",
    "website": "web site"
  }
}
```

**Response:**
```json
{
  "message": "Custom mappings added successfully",
  "mappings": {
    "datacenter": "data centre",
    "email": "e-mail",
    "website": "web site"
  }
}
```

#### 5. Get Custom Mappings

```http
GET /mappings
```

Retrieve all active custom mappings.

**Response:**
```json
{
  "mappings": {
    "datacenter": "data centre",
    "email": "e-mail"
  }
}
```

#### 6. Delete a Custom Mapping

```http
DELETE /mappings/:word
```

Remove a specific custom mapping.

**Example:**
```bash
curl -X DELETE http://localhost:3000/mappings/datacenter
```

**Response:**
```json
{
  "message": "Mapping for \"datacenter\" removed successfully",
  "mappings": {
    "email": "e-mail"
  }
}
```

#### 7. Clear All Custom Mappings

```http
DELETE /mappings
```

Remove all custom mappings.

**Response:**
```json
{
  "message": "All custom mappings cleared successfully",
  "mappings": {}
}
```

## Usage Examples

### Command Line (cURL)

#### Convert simple text

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"text": "Please organize the color samples and analyze the results."}'
```

#### Convert a JSON file

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d @myfile.json
```

#### Add custom words

```bash
curl -X POST http://localhost:3000/mappings \
  -H "Content-Type: application/json" \
  -d '{"mappings": {"internet": "Internet", "wifi": "Wi-Fi"}}'
```

### JavaScript / Node.js

```javascript
// Simple text conversion
async function convertText(text) {
  const response = await fetch('http://localhost:3000/convert', {
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
  const response = await fetch('http://localhost:3000/convert', {
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
        'http://localhost:3000/convert',
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
        'http://localhost:3000/convert',
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
    $ch = curl_init('http://localhost:3000/convert');
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
  uri = URI('http://localhost:3000/convert')
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
  const convertedPost = await fetch('http://localhost:3000/convert', {
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
      const response = await fetch('http://localhost:3000/convert', {
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

      const response = await fetch('http://localhost:3000/convert', {
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
  const response = await fetch('http://localhost:3000/convert', {
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

## Custom Mappings

Custom mappings allow you to override the built-in conversions or add your own domain-specific terms.

### When to Use Custom Mappings

1. **Industry-specific terms**: "datacenter" → "data centre"
2. **Brand preferences**: "email" → "e-mail"
3. **Override built-in conversions**: Prevent certain words from being converted
4. **Compound words**: "website" → "web site"

### Adding Custom Mappings

```bash
curl -X POST http://localhost:3000/mappings \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "datacenter": "data centre",
      "datacenters": "data centres",
      "wifi": "Wi-Fi",
      "internet": "Internet"
    }
  }'
```

### Managing Mappings

```bash
# View all custom mappings
curl http://localhost:3000/mappings

# Remove a specific mapping
curl -X DELETE http://localhost:3000/mappings/datacenter

# Clear all custom mappings
curl -X DELETE http://localhost:3000/mappings
```

### Custom Mappings Are Session-Specific

Custom mappings are stored in memory and will be lost when the server restarts. For persistent mappings:

1. Add them to `src/data/phrase_map.json` or `src/data/spelling_exceptions.json`
2. Restart the server
3. Or: Call `POST /mappings` on server startup via initialization script

## How It Works

The converter applies transformations in this order:

1. **Normalize special characters**: Em-dashes and currency symbols
2. **Apply phrase replacements**: "zip code" → "postcode"
3. **Apply spelling exceptions**: Words that should not be converted
4. **Apply custom mappings**: Your domain-specific conversions
5. **American → British translation**: "color" → "colour", "center" → "centre"
6. **-ize to -ise conversion**: Using dictionary validation to ensure accuracy
7. **Case preservation**: Maintains UPPERCASE, Titlecase, and lowercase

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
- Words in the exceptions list

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
        proxy_pass http://localhost:3000;
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
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
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
- Add custom mappings for specific words

**Problem**: Custom mappings not applying

```bash
# Check if mappings were added
curl http://localhost:3000/mappings

# Re-add mappings
curl -X POST http://localhost:3000/mappings \
  -H "Content-Type: application/json" \
  -d '{"mappings": {"word": "replacement"}}'
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

Yes, use custom mappings via the `/mappings` endpoint.

### Q: Does it preserve formatting?

Yes, it preserves:
- Case (UPPER, Title, lower)
- JSON structure
- Numbers and non-string values

### Q: What about New Zealand-specific words?

The converter uses British English (UK) dictionaries as the base for NZ spelling, which is the standard practice. For NZ-specific terms, add custom mappings.

### Q: Can I convert HTML?

The API converts text strings. For HTML, you'd need to parse it first, extract text nodes, convert them, and reconstruct the HTML.

### Q: Is there a rate limit?

No built-in rate limiting. Add rate limiting via reverse proxy if needed.

### Q: Can multiple clients share custom mappings?

Custom mappings are global to the server instance. All clients share the same mappings. For per-client mappings, deploy separate instances or modify the code to support sessions.

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
