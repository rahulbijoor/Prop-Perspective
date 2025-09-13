import asyncio
import logging
import time
import uuid
from typing import Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import uvicorn

from models import (
    DebateRequest, DebateResponse, HealthResponse, ErrorResponse,
    PropertyData
)
from debate_service import orchestrator
from config import settings
from utils import validate_property_data

logger = logging.getLogger(__name__)

# Rate limiting storage (simple in-memory implementation)
_rate_limit_storage: Dict[str, list] = {}

# Concurrency control
_active_requests = 0
_max_concurrent = settings.MAX_CONCURRENT_REQUESTS


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Max concurrent requests: {settings.MAX_CONCURRENT_REQUESTS}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered property investment debate service using CrewAI agents",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins_list(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Processing-Time"]
)

# Add trusted host middleware for security
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
    )


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """Request/response logging middleware"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Add request ID to request state
    request.state.request_id = request_id
    
    # Log request
    logger.info(
        "Request started",
        extra={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }
    )
    
    try:
        response = await call_next(request)
        
        # Calculate processing time
        processing_time = (time.time() - start_time) * 1000
        
        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Processing-Time"] = f"{processing_time:.2f}ms"
        
        # Log response
        logger.info(
            "Request completed",
            extra={
                "request_id": request_id,
                "status_code": response.status_code,
                "processing_time_ms": processing_time,
            }
        )
        
        return response
        
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000
        
        logger.error(
            "Request failed",
            extra={
                "request_id": request_id,
                "error": str(e),
                "processing_time_ms": processing_time,
            }
        )
        raise


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    """Simple rate limiting middleware"""
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Clean old entries
    if client_ip in _rate_limit_storage:
        _rate_limit_storage[client_ip] = [
            timestamp for timestamp in _rate_limit_storage[client_ip]
            if current_time - timestamp < 60  # Keep last minute
        ]
    else:
        _rate_limit_storage[client_ip] = []
    
    # Check rate limit
    if len(_rate_limit_storage[client_ip]) >= settings.RATE_LIMIT_PER_MINUTE:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=ErrorResponse(
                error="Rate limit exceeded",
                detail=f"Maximum {settings.RATE_LIMIT_PER_MINUTE} requests per minute allowed",
                request_id=getattr(request.state, 'request_id', None)
            ).dict()
        )
    
    # Add timestamp
    _rate_limit_storage[client_ip].append(current_time)
    
    return await call_next(request)


@app.middleware("http")
async def concurrency_limiting_middleware(request: Request, call_next):
    """Concurrency limiting middleware"""
    global _active_requests
    
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    if _active_requests >= _max_concurrent:
        logger.warning(f"Concurrency limit exceeded: {_active_requests}/{_max_concurrent}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=ErrorResponse(
                error="Service temporarily unavailable",
                detail=f"Maximum {_max_concurrent} concurrent requests allowed",
                request_id=getattr(request.state, 'request_id', None)
            ).dict()
        )
    
    _active_requests += 1
    try:
        response = await call_next(request)
        return response
    finally:
        _active_requests -= 1


@app.middleware("http")
async def payload_size_middleware(request: Request, call_next):
    """Payload size limiting middleware"""
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.MAX_PAYLOAD_SIZE:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content=ErrorResponse(
                    error="Payload too large",
                    detail=f"Maximum payload size is {settings.MAX_PAYLOAD_SIZE} bytes",
                    request_id=getattr(request.state, 'request_id', None)
                ).dict()
            )
    
    return await call_next(request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    request_id = getattr(request.state, 'request_id', None)
    
    logger.warning(
        "Validation error",
        extra={
            "request_id": request_id,
            "errors": exc.errors(),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="Validation error",
            detail=f"Invalid request data: {exc.errors()}",
            request_id=request_id
        ).dict()
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle value errors"""
    request_id = getattr(request.state, 'request_id', None)
    
    logger.warning(
        "Value error",
        extra={
            "request_id": request_id,
            "error": str(exc),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            error="Invalid input",
            detail=str(exc),
            request_id=request_id
        ).dict()
    )


@app.exception_handler(TimeoutError)
async def timeout_error_handler(request: Request, exc: TimeoutError):
    """Handle timeout errors"""
    request_id = getattr(request.state, 'request_id', None)
    
    logger.error(
        "Request timeout",
        extra={
            "request_id": request_id,
            "error": str(exc),
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_504_GATEWAY_TIMEOUT,
        content=ErrorResponse(
            error="Request timeout",
            detail="The request took too long to process. Please try again.",
            request_id=request_id
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    request_id = getattr(request.state, 'request_id', None)
    
    logger.error(
        "Unhandled exception",
        extra={
            "request_id": request_id,
            "error": str(exc),
            "type": type(exc).__name__,
        },
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="Internal server error",
            detail="An unexpected error occurred. Please try again later." if not settings.DEBUG else str(exc),
            request_id=request_id
        ).dict()
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION
    )


@app.post("/debate", response_model=DebateResponse)
async def generate_property_debate(request: DebateRequest, http_request: Request):
    """
    Generate a property investment debate between Pro and Con agents.
    
    This endpoint analyzes a property and returns structured arguments from both
    perspectives (buy vs. pass), along with market insights and recommendations.
    
    **Request Body:**
    - `property_data`: Property information including price, location, size, etc.
    - `context`: Optional additional context for the analysis
    - `focus_areas`: Optional list of specific areas to focus on
    
    **Response:**
    - `pro_arguments`: Arguments in favor of buying the property
    - `con_arguments`: Arguments against buying the property  
    - `summary`: Overall analysis summary
    - `recommendation`: Final recommendation (buy/pass/investigate_further)
    - `confidence_score`: Confidence in the recommendation (0.0-1.0)
    - `market_insights`: Market analysis and property metrics
    - `metadata`: Processing metadata including timing and token usage
    
    **Error Responses:**
    - `400`: Invalid input data
    - `422`: Validation error
    - `429`: Rate limit exceeded
    - `503`: Service unavailable (too many concurrent requests)
    - `504`: Request timeout
    - `500`: Internal server error
    """
    request_id = getattr(http_request.state, 'request_id', None)
    
    try:
        # Validate property data
        validation_result = validate_property_data(request.property_data)
        
        if not validation_result['is_valid']:
            raise ValueError(f"Invalid property data: {', '.join(validation_result['errors'])}")
        
        # Log validation warnings
        if validation_result['warnings']:
            logger.warning(
                "Property data validation warnings",
                extra={
                    "request_id": request_id,
                    "warnings": validation_result['warnings'],
                    "completeness_score": validation_result['completeness_score']
                }
            )
        
        # Generate debate
        logger.info(
            "Starting debate generation",
            extra={
                "request_id": request_id,
                "property_price": request.property_data.price,
                "property_location": f"{request.property_data.addressCity}, {request.property_data.addressState}",
                "focus_areas": request.focus_areas,
                "completeness_score": validation_result['completeness_score']
            }
        )
        
        response = await orchestrator.generate_debate(request)
        
        # Update request ID in response
        response.metadata.request_id = request_id
        
        logger.info(
            "Debate generation completed",
            extra={
                "request_id": request_id,
                "recommendation": response.recommendation,
                "confidence_score": response.confidence_score,
                "pro_arguments_count": len(response.pro_arguments),
                "con_arguments_count": len(response.con_arguments),
                "cache_hit": response.metadata.cache_hit,
                "processing_time_ms": response.metadata.latency_ms
            }
        )
        
        return response
        
    except ValueError as e:
        logger.warning(f"Invalid request data: {e}", extra={"request_id": request_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except TimeoutError as e:
        logger.error(f"Request timeout: {e}", extra={"request_id": request_id})
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request timeout. Please try again."
        )
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}", extra={"request_id": request_id}, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )


@app.get("/")
async def root():
    """Root endpoint with basic API information"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "debate": "/debate",
            "docs": "/docs" if settings.DEBUG else "disabled",
        }
    }


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
        server_header=False,
        date_header=False,
    )
