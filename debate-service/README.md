# Property Debate Service

An AI-powered property investment analysis service that uses CrewAI agents to generate structured debates between Pro (Buy) and Con (Pass) perspectives for real estate investment decisions.

## Features

- **Dual-Agent Analysis**: Pro and Con agents provide balanced investment perspectives
- **Market Insights**: Automated property valuation and market positioning analysis
- **Structured Arguments**: Each argument includes strength scoring and supporting evidence
- **Rate Limiting**: Built-in protection against abuse and resource exhaustion
- **Caching**: TTL-based response caching for improved performance
- **Comprehensive Logging**: Structured JSON logging with request tracing
- **Error Handling**: Robust error handling with detailed error responses
- **Input Validation**: Comprehensive property data validation and sanitization

## Quick Start

### Prerequisites

- Python 3.8+
- Google Gemini API key

### Installation

1. **Clone and navigate to the service directory:**
   ```bash
   cd debate-service
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google API key
   ```

4. **Run the service:**
   ```bash
   python run.py
   ```

The service will start on `http://localhost:8000` by default.

## API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
No authentication required for the current version.

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

#### Generate Property Debate
```http
POST /debate
```

**Request Body:**
```json
{
  "property_data": {
    "price": 450000,
    "address": "123 Main St, Austin, TX 78701",
    "addressCity": "Austin",
    "addressState": "TX",
    "addressZipcode": "78701",
    "beds": 3,
    "baths": 2.5,
    "area": 1800,
    "latitude": 30.2672,
    "longitude": -97.7431,
    "zestimate": 465000,
    "brokerName": "Example Realty"
  },
  "context": "First-time investor looking for rental property",
  "focus_areas": ["cash_flow", "appreciation", "location"]
}
```

**Response:**
```json
{
  "property_id": null,
  "pro_arguments": [
    {
      "type": "pro",
      "title": "Strong Market Position",
      "content": "This property is positioned favorably in Austin's growing market...",
      "strength": 0.85,
      "evidence": [
        "Price per sq ft below market average",
        "Austin population growth of 3.1% annually"
      ],
      "market_context": "Austin real estate market showing consistent growth"
    }
  ],
  "con_arguments": [
    {
      "type": "con",
      "title": "Potential Overvaluation Risk",
      "content": "Current asking price may reflect market peak conditions...",
      "strength": 0.72,
      "evidence": [
        "Recent market volatility indicators",
        "Interest rate environment concerns"
      ],
      "market_context": "Market showing signs of cooling"
    }
  ],
  "summary": "This Austin property presents a mixed investment opportunity with strong location fundamentals but pricing concerns that warrant careful consideration.",
  "recommendation": "investigate_further",
  "confidence_score": 0.68,
  "market_insights": {
    "price_per_sqft": 250.00,
    "market_position": "at_market",
    "location_summary": "Austin, TX (Growing tech hub with strong rental demand)",
    "investment_potential": "moderate",
    "risk_factors": [
      "Market volatility",
      "Interest rate sensitivity"
    ]
  },
  "agent_responses": [
    {
      "agent_name": "pro_agent",
      "role": "Property Investment Advocate",
      "arguments": [...],
      "confidence": 0.75,
      "reasoning": "Analysis completed using gemini-pro"
    }
  ],
  "metadata": {
    "model_name": "gemini-pro",
    "total_tokens": 1250,
    "latency_ms": 2340.5,
    "timestamp": "2024-01-15T10:30:00Z",
    "agents_used": ["pro_agent", "con_agent"],
    "cache_hit": false,
    "request_id": "1705312200_a1b2c3d4"
  }
}
```

### Property Data Schema

The `property_data` object supports the following fields (all optional):

| Field | Type | Description |
|-------|------|-------------|
| `price` | number | Listing price |
| `unformattedPrice` | number | Alternative price format |
| `address` | string | Full address |
| `addressStreet` | string | Street address |
| `addressCity` | string | City |
| `addressState` | string | State |
| `addressZipcode` | string/number | ZIP code |
| `beds` | number | Number of bedrooms |
| `baths` | number | Number of bathrooms |
| `area` | number | Square footage |
| `latitude` | number | Latitude coordinate |
| `longitude` | number | Longitude coordinate |
| `isZillowOwned` | boolean | Zillow ownership status |
| `variableData` | string | Additional property data |
| `badgeInfo` | string | Property badges/features |
| `pgapt` | string | Property-specific data |
| `sgapt` | string | Property-specific data |
| `zestimate` | number | Zillow estimate |
| `info3String` | string | Additional information |
| `brokerName` | string | Listing broker |

### Request Parameters

#### `context` (optional)
Additional context to guide the analysis (max 10,000 characters).

**Examples:**
- "First-time investor with $100k budget"
- "Looking for rental property in growing neighborhoods"
- "Considering fix-and-flip opportunity"

#### `focus_areas` (optional)
Array of specific areas to emphasize in the analysis.

**Supported focus areas:**
- `price` - Price analysis and value assessment
- `location` - Location benefits and drawbacks
- `investment` - Investment potential and returns
- `cash_flow` - Rental income potential
- `appreciation` - Property value growth prospects
- `risk` - Risk factors and mitigation
- `market` - Market conditions and trends

### Response Fields

#### Recommendation Types
- `buy` - Strong positive recommendation
- `pass` - Strong negative recommendation  
- `investigate_further` - Mixed signals requiring more research

#### Market Position Types
- `below_market` - Priced below market average
- `at_market` - Priced at market average
- `above_market` - Priced above market average

#### Investment Potential Types
- `low` - Limited investment upside
- `moderate` - Reasonable investment opportunity
- `high` - Strong investment potential

## Error Handling

### Error Response Format
```json
{
  "error": "Error type",
  "detail": "Detailed error message",
  "request_id": "unique-request-id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input data |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 503 | Service Unavailable - Too many concurrent requests |
| 504 | Gateway Timeout - Request timeout |
| 500 | Internal Server Error |

### Common Error Scenarios

#### Invalid Property Data
```json
{
  "error": "Invalid input",
  "detail": "Price values must be positive",
  "request_id": "req_123"
}
```

#### Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "detail": "Maximum 60 requests per minute allowed",
  "request_id": "req_124"
}
```

#### Request Timeout
```json
{
  "error": "Request timeout",
  "detail": "The request took too long to process. Please try again.",
  "request_id": "req_125"
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | **Required** | Google Gemini API key |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Debug mode |
| `GEMINI_MODEL` | `gemini-pro` | Gemini model to use |
| `MAX_TOKENS` | `2048` | Maximum tokens per request |
| `TEMPERATURE` | `0.7` | Model temperature |
| `TIMEOUT_SECONDS` | `30` | Request timeout |
| `MAX_RETRIES` | `3` | Maximum retry attempts |
| `RATE_LIMIT_PER_MINUTE` | `60` | Rate limit per IP |
| `MAX_CONCURRENT_REQUESTS` | `10` | Concurrent request limit |
| `ENABLE_CACHE` | `true` | Enable response caching |
| `CACHE_TTL_SECONDS` | `3600` | Cache TTL in seconds |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS origins |

### Rate Limiting

- **Per IP**: 60 requests per minute
- **Concurrent**: 10 simultaneous requests
- **Payload Size**: 1MB maximum

### Caching

- **TTL**: 1 hour by default
- **Key**: Based on property data hash
- **Storage**: In-memory (resets on restart)

## Development

### Running in Development Mode

```bash
# Set debug mode
export DEBUG=true

# Run with auto-reload
python run.py
```

### API Documentation

When running in debug mode, interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Example Test Request

```bash
curl -X POST "http://localhost:8000/debate" \
  -H "Content-Type: application/json" \
  -d '{
    "property_data": {
      "price": 450000,
      "address": "123 Main St, Austin, TX",
      "beds": 3,
      "baths": 2,
      "area": 1800
    },
    "context": "First-time investor"
  }'
```

## Architecture

### Components

1. **FastAPI Application** (`main.py`) - HTTP server and routing
2. **Debate Orchestrator** (`debate_service.py`) - Coordinates agent execution
3. **CrewAI Agents** (`agents.py`) - Pro and Con analysis agents
4. **Pydantic Models** (`models.py`) - Request/response schemas
5. **Utility Functions** (`utils.py`) - Property analysis helpers
6. **Configuration** (`config.py`) - Settings and environment management

### Agent Architecture

- **Pro Agent**: Investment advocate focused on opportunities
- **Con Agent**: Risk analyst focused on concerns and drawbacks
- **Shared Tools**: Property analysis and market data tools
- **Parallel Execution**: Both agents run simultaneously for efficiency

### Data Flow

1. Request validation and preprocessing
2. Parallel agent execution with timeout protection
3. Response parsing and argument extraction
4. Market insights generation
5. Summary and recommendation synthesis
6. Response caching and delivery

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "run.py"]
```

### Production Considerations

- Use a proper ASGI server (Gunicorn + Uvicorn)
- Implement persistent caching (Redis)
- Add monitoring and alerting
- Configure proper logging aggregation
- Set up load balancing for high availability
- Implement API authentication if needed

## Troubleshooting

### Common Issues

1. **Missing API Key**: Ensure `GOOGLE_API_KEY` is set in environment
2. **Import Errors**: Install all dependencies with `pip install -r requirements.txt`
3. **Port Conflicts**: Change `PORT` environment variable if 8000 is in use
4. **Rate Limiting**: Reduce request frequency or increase limits in config
5. **Timeout Errors**: Increase `TIMEOUT_SECONDS` for complex properties

### Logging

Logs are output in JSON format by default. Key log fields:
- `request_id`: Unique identifier for request tracing
- `processing_time_ms`: Request processing time
- `model_name`: AI model used
- `cache_hit`: Whether response was cached

### Performance Tuning

- Adjust `MAX_CONCURRENT_REQUESTS` based on server capacity
- Tune `CACHE_TTL_SECONDS` based on data freshness requirements
- Modify `TEMPERATURE` to control response creativity vs consistency
- Optimize `MAX_TOKENS` for response length vs cost balance

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review logs for error details
3. Ensure all environment variables are properly set
4. Verify API key permissions and quotas
