import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '3m',
  thresholds: {
    http_req_duration: ['p(95)<1200', 'p(99)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const CAR_ID = __ENV.CAR_ID || '1';

export default function () {
  const res = http.get(`${BASE_URL}/api/cars/${CAR_ID}`);
  check(res, { 'status 200': (r) => r.status === 200 });

  // Optional: trigger update during test window to simulate purge/invalidation impact
  if (__ENV.UPDATE_TOKEN && Math.random() < 0.01) {
    const headers = { Authorization: `Bearer ${__ENV.UPDATE_TOKEN}`, 'Content-Type': 'application/json' };
    const payload = JSON.stringify({ pricePerDay: Math.floor(Math.random() * 100) + 50 });
    http.put(`${BASE_URL}/api/cars/${CAR_ID}`, payload, { headers });
  }

  sleep(Math.random() * 1);
}
