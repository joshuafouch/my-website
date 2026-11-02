import {
	VERCEL_PROJECT_ID,
	VERCEL_TEAM_ID,
	VERCEL_TOKEN
} from '$app/env/private';
import { cached } from '#lib/server/observability/cache.ts';

const TTL = 60_000;
const API = 'https://api.vercel.com';

export type TrafficPoint = { label: string; pageviews: number; visitors: number };
export type TrafficBreakdown = { label: string; pageviews: number; visitors: number };

export type TrafficReport = {
	configured: boolean;
	error: string | null;
	since: string;
	until: string;
	pageviews: number;
	visitors: number;
	avgDailyVisitors: number;
	daily: TrafficPoint[];
	paths: TrafficBreakdown[];
	countries: TrafficBreakdown[];
	referrers: TrafficBreakdown[];
	devices: TrafficBreakdown[];
};

export type VitalMetric = {
	id: string;
	label: string;
	value: number | null;
	unit: string;
};

export type DeploymentSummary = {
	uid: string;
	url: string;
	state: string;
	target: string | null;
	createdAt: number;
	ready: number | null;
};

export type InfraReport = {
	configured: boolean;
	error: string | null;
	deployments: DeploymentSummary[];
	vitals: VitalMetric[];
	note: string;
};

function configured() {
	return Boolean(VERCEL_TOKEN && VERCEL_PROJECT_ID);
}

function teamParams(params: URLSearchParams) {
	if (VERCEL_TEAM_ID) params.set('teamId', VERCEL_TEAM_ID);
}

async function vercelGet(path: string, query: Record<string, string | undefined> = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== '') params.set(key, value);
	}
	teamParams(params);
	const url = `${API}${path}?${params}`;
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
	});
	const text = await response.text();
	let body: unknown;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = { error: text };
	}
	if (!response.ok) {
		const message =
			typeof body === 'object' &&
			body &&
			'error' in body &&
			typeof (body as { error: unknown }).error === 'object' &&
			(body as { error: { message?: string } }).error?.message
				? (body as { error: { message: string } }).error.message
				: `Vercel API ${response.status}`;
		throw new Error(message);
	}
	return body;
}

async function vercelPost(path: string, payload: Record<string, unknown>) {
	const params = new URLSearchParams();
	teamParams(params);
	const url = `${API}${path}?${params}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${VERCEL_TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});
	const text = await response.text();
	let parsed: unknown;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		parsed = { error: text };
	}
	if (!response.ok) {
		const message =
			typeof parsed === 'object' &&
			parsed &&
			'error' in parsed &&
			typeof (parsed as { error: unknown }).error === 'object' &&
			(parsed as { error: { message?: string } }).error?.message
				? (parsed as { error: { message: string } }).error.message
				: `Vercel API ${response.status}`;
		throw new Error(message);
	}
	return parsed;
}

function isoDate(d: Date) {
	return d.toISOString().slice(0, 10);
}

function rangeDays(days: number) {
	const until = new Date();
	const since = new Date(until);
	since.setUTCDate(since.getUTCDate() - (days - 1));
	return { since: isoDate(since), until: isoDate(until), days };
}

function asNumber(value: unknown) {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function aggregateRows(data: unknown): Record<string, unknown>[] {
	if (!data || typeof data !== 'object') return [];
	const rows = (data as { data?: unknown }).data;
	return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
}

async function visitsAggregate(by: string, since: string, until: string, limit?: number) {
	return vercelGet('/v1/query/web-analytics/visits/aggregate', {
		projectId: VERCEL_PROJECT_ID,
		since,
		until,
		by,
		limit: limit !== undefined ? String(limit) : undefined
	});
}

function mapBreakdown(
	rows: Record<string, unknown>[],
	dim: string
): TrafficBreakdown[] {
	return rows
		.map((row) => ({
			label: String(row[dim] ?? row.eventData ?? 'Unknown'),
			pageviews: asNumber(row.pageviews),
			visitors: asNumber(row.visitors)
		}))
		.filter((row) => row.label && row.label !== 'Others')
		.slice(0, 10);
}

export async function loadTrafficReport(days = 14): Promise<TrafficReport> {
	const { since, until, days: span } = rangeDays(days);
	const empty: TrafficReport = {
		configured: configured(),
		error: null,
		since,
		until,
		pageviews: 0,
		visitors: 0,
		avgDailyVisitors: 0,
		daily: [],
		paths: [],
		countries: [],
		referrers: [],
		devices: []
	};

	if (!configured()) {
		return {
			...empty,
			error:
				'Set VERCEL_TOKEN and VERCEL_PROJECT_ID, then enable free Web Analytics on the Vercel project.'
		};
	}

	return cached(`traffic:${since}:${until}`, TTL, async () => {
		try {
			const [dailyRaw, pathsRaw, countriesRaw, referrersRaw, devicesRaw] = await Promise.all([
				visitsAggregate('day', since, until),
				visitsAggregate('requestPath', since, until, 10),
				visitsAggregate('country', since, until, 10),
				visitsAggregate('referrerHostname', since, until, 10),
				visitsAggregate('deviceType', since, until, 10)
			]);

			const dailyRows = aggregateRows(dailyRaw);
			const daily: TrafficPoint[] = dailyRows.map((row) => ({
				label: String(row.timestamp ?? '').slice(0, 10),
				pageviews: asNumber(row.pageviews),
				visitors: asNumber(row.visitors)
			}));

			const pageviews = daily.reduce((sum, row) => sum + row.pageviews, 0);
			const visitors = daily.reduce((sum, row) => sum + row.visitors, 0);

			return {
				configured: true,
				error: null,
				since,
				until,
				pageviews,
				visitors,
				avgDailyVisitors: span > 0 ? Math.round((visitors / span) * 10) / 10 : 0,
				daily,
				paths: mapBreakdown(aggregateRows(pathsRaw), 'requestPath'),
				countries: mapBreakdown(aggregateRows(countriesRaw), 'country'),
				referrers: mapBreakdown(aggregateRows(referrersRaw), 'referrerHostname'),
				devices: mapBreakdown(aggregateRows(devicesRaw), 'deviceType')
			};
		} catch (err) {
			return {
				...empty,
				configured: true,
				error: err instanceof Error ? err.message : 'Failed to load Web Analytics'
			};
		}
	});
}

function observabilityScope() {
	if (!VERCEL_TEAM_ID) {
		throw new Error(
			'VERCEL_TEAM_ID is required for Speed Insights metrics (team_/owner id from Vercel team settings).'
		);
	}
	return {
		type: 'project' as const,
		ownerId: VERCEL_TEAM_ID,
		projectIds: [VERCEL_PROJECT_ID]
	};
}

function pickVitalNumber(payload: unknown): number | null {
	if (typeof payload === 'number' && Number.isFinite(payload)) return payload;
	if (!payload || typeof payload !== 'object') return null;

	const obj = payload as Record<string, unknown>;
	for (const key of ['value', 'avg', 'result', 'p75', 'p50']) {
		if (typeof obj[key] === 'number') return obj[key] as number;
	}

	const data = obj.data;
	if (typeof data === 'number') return data;
	if (Array.isArray(data)) {
		for (const row of data) {
			const n = pickVitalNumber(row);
			if (n != null) return n;
		}
	}
	if (data && typeof data === 'object') return pickVitalNumber(data);
	return null;
}

async function vitalValue(metric: string, startTime: string, endTime: string) {
	try {
		const result = await vercelPost('/v2/observability/query', {
			metric,
			scope: observabilityScope(),
			aggregation: 'p75',
			startTime,
			endTime
		});
		return pickVitalNumber(result);
	} catch {
		return null;
	}
}

export async function loadInfraReport(): Promise<InfraReport> {
	const note =
		'Uses free Web Analytics + Speed Insights only. Paid Observability Plus function metrics are not queried.';

	if (!configured()) {
		return {
			configured: false,
			error:
				'Set VERCEL_TOKEN and VERCEL_PROJECT_ID, then enable free Speed Insights on the Vercel project.',
			deployments: [],
			vitals: [],
			note
		};
	}

	return cached('infra:v1', TTL, async () => {
		try {
			const end = new Date();
			const start = new Date(end);
			start.setUTCDate(start.getUTCDate() - 7);
			const startTime = start.toISOString();
			const endTime = end.toISOString();

			const [deploymentsRaw, lcp, inp, cls, ttfb, fcp] = await Promise.all([
				vercelGet('/v6/deployments', {
					projectId: VERCEL_PROJECT_ID,
					limit: '8'
				}),
				vitalValue('vercel.speed_insights.lcp_ms', startTime, endTime),
				vitalValue('vercel.speed_insights.inp_ms', startTime, endTime),
				vitalValue('vercel.speed_insights.cls', startTime, endTime),
				vitalValue('vercel.speed_insights.ttfb_ms', startTime, endTime),
				vitalValue('vercel.speed_insights.fcp_ms', startTime, endTime)
			]);

			const list = (deploymentsRaw as { deployments?: Record<string, unknown>[] }).deployments ?? [];
			const deployments: DeploymentSummary[] = list.map((item) => ({
				uid: String(item.uid ?? ''),
				url: String(item.url ?? ''),
				state: String(item.state ?? item.readyState ?? 'UNKNOWN'),
				target: item.target == null ? null : String(item.target),
				createdAt: asNumber(item.createdAt),
				ready: item.ready == null ? null : asNumber(item.ready)
			}));

			const vitals: VitalMetric[] = [
				{ id: 'lcp', label: 'LCP', value: lcp, unit: 'ms' },
				{ id: 'inp', label: 'INP', value: inp, unit: 'ms' },
				{ id: 'cls', label: 'CLS', value: cls, unit: '' },
				{ id: 'ttfb', label: 'TTFB', value: ttfb, unit: 'ms' },
				{ id: 'fcp', label: 'FCP', value: fcp, unit: 'ms' }
			];
			const noVitals = vitals.every((vital) => vital.value == null);

			return {
				configured: true,
				error: noVitals
					? 'Speed Insights has no data yet. Enable it on the Vercel project, deploy to production once, then wait for real visits.'
					: null,
				deployments,
				vitals,
				note
			};
		} catch (err) {
			return {
				configured: true,
				error: err instanceof Error ? err.message : 'Failed to load Vercel infra',
				deployments: [],
				vitals: [],
				note
			};
		}
	});
}
