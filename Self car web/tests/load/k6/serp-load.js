import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    serp_load: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { target: 100, duration: '2m' },
        { target: 200, duration: '3m' },
        { target: 400, duration: '3m' },
        { target: 0, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<900', 'p(99)<1800'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const QUERIES = ['suv', 'sedan', 'honda', 'toyota', 'luxury'];

export default function () {
  const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const url = `${BASE_URL}/api/cars?q=${encodeURIComponent(q)}&page=${Math.floor(Math.random()*5)+1}`;
  const res = http.get(url);

  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 1);
}
