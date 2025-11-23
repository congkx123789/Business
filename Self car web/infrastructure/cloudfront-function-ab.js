function handler(event) {
    var request = event.request;
    var headers = request.headers || {};

    // Extract or assign AB group cookie
    var abCookie = headers.cookie && headers.cookie.value ? headers.cookie.value : '';
    var group = 'A';
    var match = /ab_group=([A|B])/i.exec(abCookie);
    if (match) {
        group = match[1].toUpperCase();
    } else {
        // Simple hash from client IP to assign group without state
        var ip = (headers['x-forwarded-for'] && headers['x-forwarded-for'].value) || '0.0.0.0';
        group = (ip.split('.').reduce(function (a, b) { return (+a) + (+b); }, 0) % 2) === 0 ? 'A' : 'B';
        request.headers['cookie'] = { value: (abCookie ? abCookie + '; ' : '') + 'ab_group=' + group + '; Path=/; Max-Age=2592000' };
    }

    // Add header for app to consume
    request.headers['x-ab-group'] = { value: group };

    // Lightweight geo personalization using country header
    // CloudFront provides CloudFront-Viewer-Country header
    var countryHeader = headers['cloudfront-viewer-country'];
    if (countryHeader && countryHeader.value) {
        request.headers['x-viewer-country'] = { value: countryHeader.value };
    }

    // Optionally route certain paths differently based on A/B group
    // Example: send B group to alternate landing
    if (request.uri === '/' && group === 'B') {
        request.uri = '/index-b.html';
    }

    return request;
}
