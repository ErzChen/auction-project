export function formatPrice(price: number, currency = 'USD') {
	const num = price;
	if (Number.isNaN(num)) return '—';
	return `${new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(num)} ${currency}`;
}

export function formatDate(value: string | null) {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export function formatDateTime(value: string | null) {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

export function toDateTimeLocal(value?: string | null) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}`;
}

export function getIdFromUrl() {
	const urlStr = window.location.href;
	const url = new URL(urlStr);
	const segments = url.pathname.split('/').filter(Boolean);
	return segments.pop();
}

export function getNextMinBid(currentPrice: number, rules: Array<{min:number; max?:number; increment:number}>) {
	const price = Number(currentPrice);
	if (Number.isNaN(price) || rules.length === 0) return null;
	const rule = rules.find(
		(r) => price >= r.min && (r.max == null || price < r.max),
	);
	return rule ? price + rule.increment : null;
}

export function formatTimeRemaining(endTime: string | null, now: number) {
	if (!endTime) return '—';
	const diff = new Date(endTime).getTime() - now;
	if (Number.isNaN(diff)) return '—';
	if (diff <= 0) return 'Auction ended';

	const totalSeconds = Math.floor(diff / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (days > 0) return `${days}d ${hours}h ${minutes}m`;
	if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
	if (minutes > 0) return `${minutes}m ${seconds}s`;
	return `${seconds}s`;
}
