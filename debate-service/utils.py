import hashlib
import logging
from typing import Optional, Dict, Any, List
from models import PropertyData

logger = logging.getLogger(__name__)


def price_per_sqft(property_data: PropertyData) -> Optional[float]:
    """Calculate price per square foot"""
    try:
        price = property_data.price or property_data.unformattedPrice
        area = property_data.area
        
        if price and area and area > 0:
            return round(price / area, 2)
        return None
    except (TypeError, ZeroDivisionError) as e:
        logger.warning(f"Error calculating price per sqft: {e}")
        return None


def compute_market_position(property_data: PropertyData, market_avg_price_per_sqft: Optional[float] = None) -> str:
    """Determine if property is below, at, or above market"""
    try:
        prop_price_per_sqft = price_per_sqft(property_data)
        
        if not prop_price_per_sqft:
            return "unknown"
        
        # Use provided market average or estimate based on location/property type
        if not market_avg_price_per_sqft:
            market_avg_price_per_sqft = estimate_market_average(property_data)
        
        if not market_avg_price_per_sqft:
            return "unknown"
        
        ratio = prop_price_per_sqft / market_avg_price_per_sqft
        
        if ratio < 0.9:
            return "below_market"
        elif ratio > 1.1:
            return "above_market"
        else:
            return "at_market"
            
    except Exception as e:
        logger.warning(f"Error computing market position: {e}")
        return "unknown"


def estimate_market_average(property_data: PropertyData) -> Optional[float]:
    """Estimate market average price per sqft based on location and property characteristics"""
    # This is a simplified estimation - in production, you'd use real market data
    base_price_per_sqft = 150.0  # Default base price
    
    try:
        # Adjust based on location (simplified)
        if property_data.addressState:
            state = property_data.addressState.upper()
            state_multipliers = {
                'CA': 2.5, 'NY': 2.2, 'WA': 1.8, 'MA': 1.9, 'HI': 2.0,
                'TX': 1.2, 'FL': 1.3, 'CO': 1.4, 'OR': 1.6, 'NV': 1.3,
                'AZ': 1.1, 'NC': 1.0, 'GA': 1.0, 'TN': 0.9, 'OH': 0.8,
                'MI': 0.8, 'IN': 0.7, 'KY': 0.7, 'AL': 0.6, 'MS': 0.6
            }
            multiplier = state_multipliers.get(state, 1.0)
            base_price_per_sqft *= multiplier
        
        # Adjust based on property size (larger properties often have lower per sqft cost)
        if property_data.area:
            if property_data.area > 3000:
                base_price_per_sqft *= 0.9
            elif property_data.area < 1000:
                base_price_per_sqft *= 1.1
        
        return round(base_price_per_sqft, 2)
        
    except Exception as e:
        logger.warning(f"Error estimating market average: {e}")
        return 150.0


def summarize_location(property_data: PropertyData) -> str:
    """Create a concise location summary"""
    try:
        parts = []
        
        if property_data.addressCity:
            parts.append(property_data.addressCity)
        
        if property_data.addressState:
            parts.append(property_data.addressState)
        
        if not parts and property_data.address:
            # Try to extract city/state from full address
            address_parts = property_data.address.split(',')
            if len(address_parts) >= 2:
                parts.extend([part.strip() for part in address_parts[-2:]])
        
        location = ', '.join(parts) if parts else "Location not specified"
        
        # Add neighborhood context if available
        context_parts = []
        if property_data.variableData:
            # variableData might contain neighborhood info
            context_parts.append(f"Area: {property_data.variableData[:50]}...")
        
        if property_data.badgeInfo:
            context_parts.append(f"Features: {property_data.badgeInfo}")
        
        if context_parts:
            location += f" ({'; '.join(context_parts)})"
        
        return location[:300]  # Limit length
        
    except Exception as e:
        logger.warning(f"Error summarizing location: {e}")
        return "Location information unavailable"


def assess_investment_potential(property_data: PropertyData) -> str:
    """Assess investment potential based on available data"""
    try:
        score = 0
        factors = []
        
        # Price efficiency
        price_sqft = price_per_sqft(property_data)
        market_position = compute_market_position(property_data)
        
        if market_position == "below_market":
            score += 2
            factors.append("Below market pricing")
        elif market_position == "at_market":
            score += 1
            factors.append("Market-rate pricing")
        
        # Property characteristics
        if property_data.beds and property_data.beds >= 3:
            score += 1
            factors.append("Good bedroom count")
        
        if property_data.baths and property_data.baths >= 2:
            score += 1
            factors.append("Adequate bathrooms")
        
        if property_data.area and property_data.area >= 1500:
            score += 1
            factors.append("Good size")
        
        # Zestimate vs price comparison
        if property_data.zestimate and property_data.price:
            zest_ratio = property_data.zestimate / property_data.price
            if zest_ratio > 1.1:
                score += 2
                factors.append("Zestimate above asking")
            elif zest_ratio > 1.05:
                score += 1
                factors.append("Zestimate slightly above asking")
        
        # Determine potential level
        if score >= 5:
            return "high"
        elif score >= 3:
            return "moderate"
        else:
            return "low"
            
    except Exception as e:
        logger.warning(f"Error assessing investment potential: {e}")
        return "moderate"


def identify_risk_factors(property_data: PropertyData) -> List[str]:
    """Identify potential risk factors"""
    risks = []
    
    try:
        # Price-related risks
        market_position = compute_market_position(property_data)
        if market_position == "above_market":
            risks.append("Property priced above market average")
        
        # Property characteristic risks
        if property_data.beds and property_data.beds < 2:
            risks.append("Limited bedroom count may affect resale")
        
        if property_data.baths and property_data.baths < 1.5:
            risks.append("Limited bathroom count")
        
        if property_data.area and property_data.area < 800:
            risks.append("Small property size may limit appeal")
        
        # Zestimate concerns
        if property_data.zestimate and property_data.price:
            zest_ratio = property_data.zestimate / property_data.price
            if zest_ratio < 0.9:
                risks.append("Asking price significantly above Zestimate")
        
        # Missing information risks
        if not property_data.price and not property_data.unformattedPrice:
            risks.append("Price information not available")
        
        if not property_data.area:
            risks.append("Property size not specified")
        
        # Location risks (simplified)
        if not property_data.addressCity or not property_data.addressState:
            risks.append("Incomplete location information")
        
        return risks[:5]  # Limit to top 5 risks
        
    except Exception as e:
        logger.warning(f"Error identifying risk factors: {e}")
        return ["Unable to assess risks due to data limitations"]


def generate_property_hash(property_data: PropertyData) -> str:
    """Generate a hash for caching purposes"""
    try:
        # Create a string representation of key property attributes
        key_data = {
            'price': property_data.price,
            'address': property_data.address,
            'beds': property_data.beds,
            'baths': property_data.baths,
            'area': property_data.area,
            'zestimate': property_data.zestimate
        }
        
        # Convert to string and hash
        data_str = str(sorted(key_data.items()))
        return hashlib.md5(data_str.encode()).hexdigest()
        
    except Exception as e:
        logger.warning(f"Error generating property hash: {e}")
        return hashlib.md5(str(property_data.dict()).encode()).hexdigest()


def format_currency(amount: Optional[float]) -> str:
    """Format currency values"""
    if amount is None:
        return "N/A"
    
    try:
        if amount >= 1_000_000:
            return f"${amount/1_000_000:.1f}M"
        elif amount >= 1_000:
            return f"${amount/1_000:.0f}K"
        else:
            return f"${amount:,.0f}"
    except (TypeError, ValueError):
        return "N/A"


def validate_property_data(property_data: PropertyData) -> Dict[str, Any]:
    """Validate property data and return validation results"""
    validation_result = {
        'is_valid': True,
        'warnings': [],
        'errors': [],
        'completeness_score': 0
    }
    
    try:
        total_fields = 0
        complete_fields = 0
        
        # Check required fields
        required_fields = ['price', 'address', 'beds', 'baths', 'area']
        for field in required_fields:
            total_fields += 1
            value = getattr(property_data, field, None)
            if value is not None:
                complete_fields += 1
            else:
                validation_result['warnings'].append(f"Missing {field}")
        
        # Check optional but important fields
        important_fields = ['addressCity', 'addressState', 'zestimate', 'latitude', 'longitude']
        for field in important_fields:
            total_fields += 1
            value = getattr(property_data, field, None)
            if value is not None:
                complete_fields += 1
        
        # Calculate completeness score
        validation_result['completeness_score'] = (complete_fields / total_fields) * 100
        
        # Validate data ranges
        if property_data.price and property_data.price <= 0:
            validation_result['errors'].append("Price must be positive")
            validation_result['is_valid'] = False
        
        if property_data.beds and property_data.beds < 0:
            validation_result['errors'].append("Beds cannot be negative")
            validation_result['is_valid'] = False
        
        if property_data.baths and property_data.baths < 0:
            validation_result['errors'].append("Baths cannot be negative")
            validation_result['is_valid'] = False
        
        if property_data.area and property_data.area <= 0:
            validation_result['errors'].append("Area must be positive")
            validation_result['is_valid'] = False
        
        return validation_result
        
    except Exception as e:
        logger.error(f"Error validating property data: {e}")
        validation_result['is_valid'] = False
        validation_result['errors'].append("Validation error occurred")
        return validation_result
