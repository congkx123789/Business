import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export let options = {
  scenarios: {
    campaign_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 200 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const VEHICLE_IDS = (__ENV.VEHICLE_IDS || '1,2,3,4,5').split(',');

const VDPTrend = new Trend('vdp_duration');

export default function () {
  const id = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
  const res = http.get(`${BASE_URL}/api/cars/${id}`);
  VDPTrend.add(res.timings.duration);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'ttfb < 400ms': (r) => r.timings.waiting < 400,
  });

  sleep(Math.random() * 1);
}
