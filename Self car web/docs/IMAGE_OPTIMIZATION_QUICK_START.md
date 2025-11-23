# Image Optimization Quick Start

## Quick Setup Checklist

### 1. AWS Infrastructure (One-time setup)

- [ ] Create S3 bucket: `selfcar-images-prod`
- [ ] Block public access (make bucket private)
- [ ] Create CloudFront Origin Access Control (OAC)
- [ ] Update S3 bucket policy to allow CloudFront access
- [ ] Create CloudFront distribution pointing to S3 bucket
- [ ] Configure CloudFront cache policies (1 year TTL for images)
- [ ] Deploy Lambda@Edge function for image transformation (optional)

### 2. Backend Configuration

```properties
# Add to application-prod.properties
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=selfcar-images-prod
AWS_S3_REGION=us-east-1
AWS_CDN_DOMAIN=d1234567890.cloudfront.net
IMAGE_CDN_ENABLED=true
```

### 3. Frontend Configuration

```env
# Add to frontend/.env.production
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=https://d1234567890.cloudfront.net
```

### 4. Test Image Upload

```bash
POST /api/car-images/upload
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

file: [image file]
carId: 1
```

### 5. Verify CDN Delivery

1. Check image URL in database: Should be CloudFront URL
2. Open browser DevTools → Network
3. Load VDP page
4. Verify images load from `*.cloudfront.net`
5. Check query parameters: `?width=800&format=webp&quality=85`

## Image URL Format

**Original (S3)**: `s3://selfcar-images-prod/cars/123/image.jpg`

**CDN Optimized**: `https://d1234567890.cloudfront.net/cars/123/image.jpg?width=800&format=webp&quality=85`

## Frontend Usage

```javascript
import { getVDPImageUrl, getCardImageUrl } from '../utils/imageCDN'

// For VDP (Vehicle Detail Page)
const optimizedUrl = getVDPImageUrl(car.imageUrl, true)

// For Car Cards
const cardUrl = getCardImageUrl(car.imageUrl)

// With responsive srcset
<img 
  src={getVDPImageUrl(car.imageUrl)} 
  srcSet={getResponsiveSrcSet(car.imageUrl, 'detail')}
  sizes={getResponsiveSizes('detail')}
/>
```

## Success Metrics

After deployment, monitor:

- **Image Size Reduction**: 30-50% smaller files
- **CDN Cache Hit Rate**: >85% on VDP assets
- **LCP Improvement**: 20-30% faster on VDP pages
- **Bandwidth Savings**: 40-60% reduction

## Troubleshooting

**Images not loading?**
- Check CloudFront distribution status
- Verify OAC configuration
- Check S3 bucket policy

**Images not optimized?**
- Verify query parameters are in URL
- Check Lambda@Edge function logs
- Ensure CloudFront function is associated

**Metrics not collecting?**
- Check browser console for errors
- Verify `/api/metrics/performance` endpoint
- Check CORS settings

## Next Steps

1. Monitor baseline metrics for 1 week
2. Deploy to staging environment
3. Test with sample VDP pages
4. Measure improvements
5. Roll out to production

For detailed setup, see [IMAGE_OPTIMIZATION_SETUP.md](./IMAGE_OPTIMIZATION_SETUP.md)

