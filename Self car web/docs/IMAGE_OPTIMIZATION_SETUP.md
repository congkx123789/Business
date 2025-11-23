# Image Optimization & CDN Setup Guide

This guide covers the implementation of image optimization and CDN delivery for the SelfCar platform, with a focus on Vehicle Detail Pages (VDP) for maximum ROI.

## Overview

The implementation includes:
1. **Baseline Metrics Collection**: LCP, TTFB, CLS, INP, cache hit rates, and p95 API latencies
2. **S3 Private Bucket**: All images stored in private S3 buckets
3. **CloudFront CDN**: Image delivery through CDN with Origin Access Control (OAC)
4. **On-the-fly Image Transforms**: Responsive sizes, WebP/AVIF, adaptive compression via CDN URL parameters
5. **VDP Prioritization**: Priority implementation on Vehicle Detail Pages

## Success Targets

- **30-50% smaller median image bytes** on VDP assets
- **+15-25% CDN hit ratio** on VDP assets
- **Improved LCP** by 20-30% on VDP pages
- **Reduced bandwidth costs** by 40-60%

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       │ CDN URL with params
       │ ?width=800&format=webp&quality=85
       ▼
┌─────────────────────────────────────┐
│      CloudFront CDN                 │
│  ┌───────────────────────────────┐  │
│  │  Lambda@Edge Function         │  │
│  │  - Image Resizing             │  │
│  │  - Format Conversion (WebP)   │  │
│  │  - Quality Optimization       │  │
│  │  - Cache Headers              │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │ OAC (Origin Access Control)
       │ Private Access Only
       ▼
┌─────────────────────────────────────┐
│      S3 Private Bucket              │
│  - cars/{carId}/{uuid}.jpg          │
│  - All objects: PRIVATE ACL         │
└─────────────────────────────────────┘
```

## AWS Infrastructure Setup

### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://selfcar-images-prod --region us-east-1

# Block public access (enforce private bucket)
aws s3api put-public-access-block \
    --bucket selfcar-images-prod \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 2. Create Origin Access Control (OAC)

```bash
# Create OAC for CloudFront
aws cloudfront create-origin-access-control \
    --origin-access-control-config \
    Name=selfcar-images-oac,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4
```

Note the OAC ID from the response.

### 3. Update S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::selfcar-images-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy --bucket selfcar-images-prod --policy file://bucket-policy.json
```

### 4. Create CloudFront Distribution

1. Go to CloudFront Console
2. Create Distribution
3. **Origin Domain**: `selfcar-images-prod.s3.us-east-1.amazonaws.com`
4. **Origin Access**: Select "Origin Access Control settings (recommended)"
5. **Origin Access Control**: Select the OAC created above
6. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
7. **Allowed HTTP Methods**: GET, HEAD, OPTIONS
8. **Cache Policy**: Create custom policy:
   - **TTL**: 
     - Default: 31536000 (1 year)
     - Maximum: 31536000
     - Minimum: 86400 (1 day)
   - **Query String Forwarding**: Forward all
   - **Headers**: Forward all
9. **Origin Request Policy**: Create custom policy:
   - **Query String Forwarding**: Forward all
   - **Headers**: Forward Host, Origin
10. **Function Associations** (Viewer Request):
    - Lambda@Edge function for image transformation (see below)

### 5. Lambda@Edge Function for Image Transformation

Create a Lambda function for image transformation:

```javascript
// Lambda@Edge function for image transformation
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;
    const querystring = request.querystring;
    
    // Parse query parameters
    const params = new URLSearchParams(querystring);
    const width = params.get('width');
    const format = params.get('format') || 'auto';
    const quality = params.get('quality') || '85';
    
    // If no transformation needed, return original request
    if (!width && format === 'auto') {
        return request;
    }
    
    // Use CloudFront image transformation (requires CloudFront Functions or Lambda@Edge)
    // For production, consider using AWS Lambda with Sharp library for better control
    // or use CloudFront's built-in image transformation features
    
    // Add transformation parameters to request
    if (width) {
        request.uri = `${uri}?width=${width}&format=${format}&quality=${quality}`;
    }
    
    return request;
};
```

**Alternative**: Use AWS Lambda with Sharp library for advanced image processing:

```bash
# Install Sharp for Lambda
npm install sharp

# Package for Lambda deployment
zip -r image-transform.zip index.js node_modules/
```

### 6. CloudFront Function (Simpler Alternative)

For simpler transformations, use CloudFront Functions:

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var querystring = request.querystring;
    
    // Add cache headers
    request.headers['cache-control'] = {
        value: 'public, max-age=31536000, immutable'
    };
    
    // Add CORS headers for image requests
    request.headers['access-control-allow-origin'] = {
        value: '*'
    };
    
    return request;
}
```

## Backend Configuration

### 1. Environment Variables

Add to `application-prod.properties` or environment:

```properties
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=selfcar-images-prod
AWS_S3_REGION=us-east-1
AWS_CDN_DOMAIN=d1234567890.cloudfront.net

# Image CDN Configuration
IMAGE_CDN_ENABLED=true
IMAGE_CDN_BASE_URL=https://d1234567890.cloudfront.net
```

### 2. Update CarImageController

The controller already supports image URLs. Update it to use S3 service:

```java
@PostMapping("/upload")
public ResponseEntity<?> uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam Long carId,
    @AuthenticationPrincipal UserPrincipal principal
) {
    try {
        String s3Key = s3ImageService.uploadImage(file, carId);
        String cdnUrl = s3ImageService.getCdnUrl(s3Key);
        
        CarImage carImage = new CarImage();
        carImage.setCar(carRepository.findById(carId).orElseThrow());
        carImage.setImageUrl(cdnUrl);
        carImage.setIsPrimary(false);
        
        CarImage saved = carImageRepository.save(carImage);
        return ResponseEntity.ok(saved);
    } catch (Exception e) {
        log.error("Error uploading image", e);
        return ResponseEntity.badRequest()
            .body(new ApiResponse(false, "Failed to upload image: " + e.getMessage()));
    }
}
```

## Frontend Configuration

### 1. Environment Variables

Add to `frontend/.env.production`:

```env
VITE_CDN_ENABLED=true
VITE_CDN_BASE_URL=https://d1234567890.cloudfront.net
```

### 2. Image Usage

The frontend utilities are already set up. Components automatically use optimized images:

- **CarDetail page**: Uses `getVDPImageUrl()` with responsive srcset
- **CarCard component**: Uses `getCardImageUrl()` with responsive srcset

## Baseline Metrics Collection

### 1. Enable Metrics Collection

Metrics collection is automatically initialized in `main.jsx`. Ensure the backend endpoint is accessible.

### 2. View Baseline Metrics

```bash
# Get baseline metrics
curl http://localhost:8080/api/metrics/performance/baseline
```

### 3. Monitor in Production

Metrics are recorded to Micrometer/Prometheus:

```bash
# Prometheus metrics endpoint
curl http://localhost:8080/actuator/prometheus | grep performance
```

## Testing

### 1. Test Image Upload

```bash
curl -X POST http://localhost:8080/api/car-images/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@car-image.jpg" \
  -F "carId=1"
```

### 2. Test CDN URL Generation

```javascript
// In browser console
import { getVDPImageUrl } from './utils/imageCDN'
const url = getVDPImageUrl('cars/1/image.jpg')
console.log(url) // Should include CDN domain and query params
```

### 3. Verify Image Optimization

1. Open browser DevTools → Network tab
2. Load a VDP page
3. Check image requests:
   - Should come from CloudFront domain
   - Should include query parameters (width, format, quality)
   - Should have appropriate cache headers
   - File size should be reduced vs original

## Performance Monitoring

### Key Metrics to Track

1. **LCP (Largest Contentful Paint)**
   - Target: < 2.5s
   - Monitor: VDP pages specifically

2. **TTFB (Time to First Byte)**
   - Target: < 600ms
   - Monitor: API endpoints

3. **CLS (Cumulative Layout Shift)**
   - Target: < 0.1
   - Monitor: All pages

4. **INP (Interaction to Next Paint)**
   - Target: < 200ms
   - Monitor: Interactive elements

5. **Cache Hit Rates**
   - Browser cache: Target > 70%
   - CDN cache: Target > 85%

6. **p95 API Latencies**
   - Target: < 500ms

### Dashboard Queries (Prometheus/Grafana)

```promql
# LCP p95
histogram_quantile(0.95, rate(performance_lcp_bucket[5m]))

# CDN Cache Hit Rate
sum(rate(performance_cache_hit_rate_cdn[5m])) / sum(rate(performance_cache_total[5m]))

# Image Size Reduction
(original_image_size - optimized_image_size) / original_image_size * 100
```

## Troubleshooting

### Images not loading from CDN

1. Check CloudFront distribution status
2. Verify OAC configuration
3. Check S3 bucket policy
4. Verify CORS settings if needed

### Images not optimized

1. Check Lambda@Edge function logs
2. Verify query parameters are being passed
3. Check CloudFront function associations

### Metrics not collecting

1. Check browser console for errors
2. Verify `/api/metrics/performance` endpoint is accessible
3. Check CORS settings for metrics endpoint

## Next Steps

1. **Monitor baseline metrics** for 1 week
2. **Deploy CDN infrastructure** to staging
3. **Test with sample images** on VDP pages
4. **Measure improvements**:
   - Image file sizes (before/after)
   - CDN cache hit rates
   - LCP improvements
   - Bandwidth usage
5. **Roll out to production** gradually
6. **Monitor for 1 month** and iterate

## Cost Optimization

- **S3 Storage**: Use S3 Intelligent-Tiering for automatic cost optimization
- **CloudFront**: Use CloudFront caching to reduce origin requests
- **Lambda@Edge**: Monitor invocation costs and optimize function size
- **Image Formats**: Prefer WebP/AVIF for better compression

## References

- [AWS CloudFront Image Optimization](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/image-optimization.html)
- [S3 Origin Access Control](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)

