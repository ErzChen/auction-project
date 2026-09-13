export function formatPrice(price, currency = 'USD') {
	const num = price;
	if (Number.isNaN(num)) return '—';
	return `${new Intl.NumberFormat(undefined, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(num)} ${currency}`;
}

export function formatDate(value) {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export function formatDateTime(value) {
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

export function getIdFromUrl() {
	const urlStr = window.location.href;
	const url = new URL(urlStr);
	const segments = url.pathname.split('/').filter(Boolean);
	return segments.pop();
}

export function formatTimeRemaining(endTime, now) {
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
