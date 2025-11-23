"use strict";

// Lambda@Edge: Viewer Request
// Near-me search routing: map request to regional inventory object and hint filtering
// Note: Lambda@Edge cannot fetch external data; it rewrites URIs so the
// origin serves region-level cached inventory. Distance filtering is hinted via
// query params (client or origin can apply). For true edge filtering, consider CloudFront Functions + pre-bucketed geohash.

exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers || {};
    const uri = request.uri || '/';

    // Only act on near-me search endpoint
    if (!uri.startsWith('/search/nearby')) {
        return request;
    }

    // Determine region from viewer country/headers or query param override
    const qs = new URLSearchParams(request.querystring || '');
    const regionOverride = qs.get('region');
    let region = regionOverride || 'US';

    const countryHeader = headers['cloudfront-viewer-country'];
    if (!regionOverride && countryHeader && countryHeader[0] && countryHeader[0].value) {
        const country = countryHeader[0].value;
        // Map country to region (simple mapping; extend as needed)
        if (country === 'US' || country === 'CA') region = 'NA';
        else if (country === 'GB' || country === 'DE' || country === 'FR') region = 'EU';
        else if (country === 'JP' || country === 'SG' || country === 'AU') region = 'APAC';
        else region = 'GLOBAL';
    }

    // Optional geohash prefix bucketing (if client passes geohash)
    const geohash = qs.get('geohash');
    let bucket = geohash ? geohash.substring(0, 5) : 'all';

    // Rewrite to regional inventory object path; origin (S3) serves cached JSON
    // Example: s3://bucket/edge/inventory/NA/all.json
    request.uri = `/edge/inventory/${region}/${bucket}.json`;

    // Preserve original lat/lon for client/origin-side filtering
    const lat = qs.get('lat');
    const lon = qs.get('lon');
    const radius = qs.get('radius') || '50'; // km default
    const newQs = new URLSearchParams();
    if (lat) newQs.set('lat', lat);
    if (lon) newQs.set('lon', lon);
    if (radius) newQs.set('radius', radius);

    request.querystring = newQs.toString();

    // Add headers for downstream services
    request.headers['x-region'] = [{ key: 'x-region', value: region }];
    if (geohash) request.headers['x-geohash'] = [{ key: 'x-geohash', value: geohash }];

    return request;
};
