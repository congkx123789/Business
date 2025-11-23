/**
 * CloudFront Lambda@Edge Function for Image Transformation
 * 
 * This function processes image requests through CloudFront and applies
 * transformations based on query parameters (width, format, quality).
 * 
 * For production, consider using AWS Lambda with Sharp library for more
 * advanced transformations, or use CloudFront's built-in image optimization.
 * 
 * Deployment:
 * 1. Create Lambda function in us-east-1 (required for CloudFront)
 * 2. Use Node.js 18.x runtime
 * 3. Package with dependencies (if using Sharp)
 * 4. Associate with CloudFront distribution as Viewer Request
 */

'use strict';

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const uri = request.uri;
    const querystring = request.querystring;
    
    // Parse query parameters
    const params = new URLSearchParams(querystring);
    const width = params.get('width');
    const format = params.get('format') || 'auto';
    const quality = params.get('quality') || '85';
    const height = params.get('height');
    const focus = params.get('focus');
    
    // Add cache headers for optimized images
    if (!request.headers['cache-control']) {
        request.headers['cache-control'] = [{
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
        }];
    }
    
    // Add CORS headers for image requests
    request.headers['access-control-allow-origin'] = [{
        key: 'Access-Control-Allow-Origin',
        value: '*'
    }];
    
    // Add Vary header for content negotiation
    request.headers['vary'] = [{
        key: 'Vary',
        value: 'Accept'
    }];
    
    // If transformation parameters are present, modify request
    // Note: Actual image transformation would happen in a separate Lambda
    // function or using CloudFront's image optimization features
    
    if (width || format !== 'auto' || quality !== '85') {
        // Add transformation parameters to request headers
        // These will be used by the image transformation service
        request.headers['x-image-transform-width'] = [{
            key: 'X-Image-Transform-Width',
            value: width || ''
        }];
        
        request.headers['x-image-transform-format'] = [{
            key: 'X-Image-Transform-Format',
            value: format
        }];
        
        request.headers['x-image-transform-quality'] = [{
            key: 'X-Image-Transform-Quality',
            value: quality
        }];
        
        if (height) {
            request.headers['x-image-transform-height'] = [{
                key: 'X-Image-Transform-Height',
                value: height
            }];
        }
        
        if (focus === 'auto') {
            request.headers['x-image-transform-focus'] = [{
                key: 'X-Image-Transform-Focus',
                value: 'auto'
            }];
        }
    }
    
    // Ensure Accept header is forwarded for content negotiation
    if (!request.headers['accept']) {
        request.headers['accept'] = [{
            key: 'Accept',
            value: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }];
    }
    
    return request;
};

/**
 * Alternative: Use CloudFront Functions (simpler, faster, but less powerful)
 * 
 * CloudFront Functions are executed at edge locations and are faster than
 * Lambda@Edge, but have limitations (5ms timeout, limited Node.js features).
 * 
 * For simple header manipulation, use CloudFront Functions.
 * For complex image transformation, use Lambda@Edge with Sharp.
 */

function cloudfrontFunctionHandler(event) {
    var request = event.request;
    
    // Add cache headers
    request.headers['cache-control'] = {
        value: 'public, max-age=31536000, immutable'
    };
    
    // Add CORS headers
    request.headers['access-control-allow-origin'] = {
        value: '*'
    };
    
    return request;
}

