import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { useAuthContext } from '../context/AuthContext';
import { createPageStyles as styles } from '../styles/createPage';
import { sharedStyles } from '../styles/shared';
import { auctionListingsStyles as cardStyles } from '../styles/auctionListings';
import { colors } from '../constants/theme';
import { formatDate, formatPrice } from '../lib/library';
import { getImageUrl } from '../lib/auctionActions';
import { ImageItem } from '../constants/types';

const CATEGORIES = [
	'Electronics',
	'Furniture',
	'Collectibles',
	'Jewelry & Watches',
	'Art',
	'Vehicles',
	'Sporting Goods',
	'Home & Garden',
	'Other',
];

const CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP'];

let uid = 0;
const nextId = () => `row-${++uid}`;

function emptyIncrement() {
	return { id: nextId(), min: '', max: '', increment: '' };
}

function emptyDetail() {
	return { id: nextId(), detail: '', info: '' };
}

function toDateTimeLocal(value?: string | null) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}`;
}

export default function CreatePage({ auction, onCreated, onCancel }) {
	async function handleSubmit() {
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}
		setError(null);
		setSubmitting(true);

		let uploadedPaths: string[];
		try {
			setUploadingImages(true);
			uploadedPaths = await uploadImages();
		} catch {
			setError('Photo upload failed — try again.');
			setSubmitting(false);
			setUploadingImages(false);
			return;
		}
		setUploadingImages(false);

		let uploadCursor = 0;
		const finalImagePaths = images.map((img) =>
			img.path ? img.path : uploadedPaths[uploadCursor++],
		);

		const basePayload = {
			starting_price: isEditing ? auction!.starting_price : Number(startingPrice),
			bid_increment_rules: JSON.stringify(
				increments.map((row) => ({
					min: Number(row.min),
					max: row.max === '' ? null : Number(row.max),
					increment: Number(row.increment),
				})),
			),
			currency,
			title: title.trim(),
			description: description.trim() || null,
			condition,
			details: JSON.stringify(
				details.filter((row) => row.detail.trim() || row.info.trim()),
			),
			category,
			image_paths: JSON.stringify(finalImagePaths),
			location: location.trim(),
			shipping_pickup_description: pickupDescription.trim(),
			is_shipping_available: shippingAvailable ? 1 : 0,
			shipping_cost: shippingAvailable ? Number(shippingCost) : null,
			start_time: auctionStarted ? auction!.start_time : startDate,
			end_time: auctionExpired ? auction!.end_time : endDate,
		};

		const payload = isEditing
			? basePayload
			: { ...basePayload, user_id: userId, current_price: Number(startingPrice) };

		const url = isEditing
			? `${process.env.EXPO_PUBLIC_API_BASE}/api/auctions/${auction!.auction_id}`
			: `${process.env.EXPO_PUBLIC_API_BASE}/api/auctions`;

		try {
			const res = await fetch(url, {
				method: isEditing ? 'PATCH' : 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const savedAuction = await res.json();
			onCreated?.(savedAuction);
		} catch {
			setError('Something went wrong');
		} finally {
			setSubmitting(false);
		}
	}

	function validate() {
		if (!title.trim()) return 'Give your listing a title.';
		if (title.length > 100) return 'Titles are limited to 100 characters.';
		if (description.length > 1000) return 'Descriptions are limited to 1000 characters.';
		if (!condition) return 'Select a condition.';
		if (!category) return 'Select a category.';
		if (images.length === 0) return 'Add at least one photo.';
		if (!startingPrice || Number(startingPrice) <= 0) return 'Enter a starting price above 0.';
		for (const row of increments) {
			if (row.min === '' || row.increment === '') return 'Fill in every bid tier, or remove the empty one.';
			if (row.max !== '' && Number(row.max) <= Number(row.min)) return 'Each tier\u2019s max must be greater than its min.';
		}
		if (!location.trim()) return 'Enter a pickup location.';
		if (!locationVerified) return 'Select a valid address from the suggestions.';
		if (!pickupDescription.trim()) return 'Describe pickup (and shipping, if offered).';
		if (shippingAvailable && (!shippingCost || Number(shippingCost) < 0)) {
			return 'Enter a shipping cost, or turn shipping off.';
		}
		if (!startDate || !endDate) return 'Set when bidding opens and closes.';
		if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
			return 'End time must be after the start time.';
		}
		return null;
	}

	async function uploadImages() {
		const newImages = images.filter((img) => img.file);
		if (newImages.length === 0) return [];
		const formData = new FormData();
		newImages.forEach((img) => formData.append('images', img.file as File));
		const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/auctions/uploads`, {
			method: 'POST',
			headers: {
				'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});
		if (!res.ok) {
			throw new Error('Photo upload failed');
		}
		const data = await res.json();
		return data.paths as string[];
	}

	function handleCancel() {
		if (isEditing && typeof window !== 'undefined' && window.confirm) {
			const confirmed = window.confirm('Discard your changes to this listing?');
			if (!confirmed) return;
		}
		onCancel?.();
	}

	async function handleDelete() {
		if (typeof window !== 'undefined' && window.confirm) {
			const confirmed = window.confirm(
				'Delete this listing? This can\'t be undone.',
			);
			if (!confirmed) return;
		}
		setError(null);
		setDeleting(true);
		try {
			const res = await fetch(
				`${process.env.EXPO_PUBLIC_API_BASE}/api/auctions/${auction!.auction_id}`,
				{
					method: 'DELETE',
					headers: {
						'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Failed to delete listing');
				return;
			}
			onCancel?.();
		} catch {
			setError('Failed to delete listing');
		} finally {
			setDeleting(false);
		}
	}

	function removeImage(id: string) {
		setImages((prev) => prev.filter((img) => img.id !== id));
	}

	function updateIncrement(id: string, field: 'min' | 'max' | 'increment', value: string) {
		setIncrements((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
	}
	function addIncrement() {
		setIncrements((prev) => [...prev, emptyIncrement()]);
	}
	function removeIncrement(id: string) {
		setIncrements((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
	}

	function updateDetail(id: string, field: 'detail' | 'info', value: string) {
		setDetails((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
	}
	function addDetail() {
		setDetails((prev) => [...prev, emptyDetail()]);
	}
	function removeDetail(id: string) {
		setDetails((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
	}

	async function fetchLocationSuggestions(text: string) {
		if (text.trim().length < 3) {
			setLocationSuggestions([]);
			return;
		}
		setLocationLoading(true);
		try {
			const res = await fetch(
				`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`
			);
			const data = await res.json();
			const suggestions = (data.features || [])
				.map((f: any, i: number) => ({
					id: f.properties?.osm_id ? `${f.properties.osm_type}-${f.properties.osm_id}` : String(i),
					text: formatPhotonAddress(f.properties || {}),
				}))
				.filter((s: { id: string; text: string }) => s.text);
			setLocationSuggestions(suggestions);
		} catch {
			setLocationSuggestions([]);
		} finally {
			setLocationLoading(false);
		}
	}

	function formatPhotonAddress(props: Record<string, any>): string {
		const parts: string[] = [];
		if (props.housenumber && props.street) parts.push(`${props.housenumber} ${props.street}`);
		else if (props.street) parts.push(props.street);
		else if (props.name) parts.push(props.name);
		if (props.city) parts.push(props.city);
		else if (props.county) parts.push(props.county);
		if (props.state) parts.push(props.state);
		if (props.postcode) parts.push(props.postcode);
		if (props.country) parts.push(props.country);
		return parts.filter(Boolean).join(', ');
	}

	function handleLocationChange(text: string) {
		setLocation(text);
		setLocationVerified(false);
		if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
		if (text.trim().length < 3) {
			setLocationSuggestions([]);
			return;
		}
		locationDebounceRef.current = setTimeout(() => fetchLocationSuggestions(text), 300);
	}

	function handleSelectLocation(suggestion: { id: string; text: string }) {
		setLocation(suggestion.text);
		setLocationVerified(true);
		setLocationSuggestions([]);
	}

	const isEditing = Boolean(auction);
	const auctionStarted =
		isEditing &&
		(auction!.status !== 'upcoming' || new Date(auction!.start_time).getTime() <= Date.now());
	const auctionExpired =
		isEditing &&
		(auction!.status === 'expired' ||
			auction!.status === 'sold' ||
			new Date(auction!.end_time).getTime() <= Date.now());

	const { user, token } = useAuthContext();
	const { id: userId, username } = user;

	const [deleting, setDeleting] = useState(false);
	const [title, setTitle] = useState(auction?.title || '');
	const [description, setDescription] = useState(auction?.description || '');
	const [condition, setCondition] = useState(auction?.condition ?? '');
	const [category, setCategory] = useState(auction?.category ?? '');
	const [categoryOpen, setCategoryOpen] = useState(false);
	const [images, setImages] = useState<Array<ImageItem>>(() =>
		auction
			? (JSON.parse(auction.image_paths || '[]')).map((path) => ({
					id: nextId(),
					uri: getImageUrl(path),
					path,
				}))
			: [],
	);
	const [uploadingImages, setUploadingImages] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [startingPrice, setStartingPrice] = useState(
		auction ? String(auction.starting_price ?? '') : '',
	);
	const [currency, setCurrency] = useState(auction?.currency ?? 'USD');
	const [increments, setIncrements] = useState(() => {
		if (!auction) return [emptyIncrement()];
		const parsed = JSON.parse((auction.bid_increment_rules as any) || '[]');
		if (!parsed.length) return [emptyIncrement()];
		return parsed.map((rule: any) => ({
			id: nextId(),
			min: rule.min != null ? String(rule.min) : '',
			max: rule.max != null ? String(rule.max) : '',
			increment: rule.increment != null ? String(rule.increment) : '',
		}));
	});
	const [details, setDetails] = useState(() => {
		if (!auction) return [emptyDetail()];
		const parsed = JSON.parse(auction.details || '[]');
		if (!parsed.length) return [emptyDetail()];
		return parsed.map((d: any) => ({
			id: nextId(),
			detail: d.detail ?? '',
			info: d.info ?? '',
		}));
	});
	const [location, setLocation] = useState(auction?.location ?? '');
	const [locationVerified, setLocationVerified] = useState(Boolean(auction?.location));
	const [locationSuggestions, setLocationSuggestions] = useState([]);
	const [locationLoading, setLocationLoading] = useState(false);
	const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [pickupDescription, setPickupDescription] = useState(
		auction?.shipping_pickup_description ?? '',
	);
	const [shippingAvailable, setShippingAvailable] = useState(
		Boolean(auction?.is_shipping_available),
	);
	const [shippingCost, setShippingCost] = useState(
		auction?.shipping_cost != null ? String(auction.shipping_cost) : '',
	);
	const [startDate, setStartDate] = useState(toDateTimeLocal(auction?.start_time));
	const [endDate, setEndDate] = useState(toDateTimeLocal(auction?.end_time));
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitHovered, setSubmitHovered] = useState(false);
	const [cancelHovered, setCancelHovered] = useState(false);
	const [deleteHovered, setDeleteHovered] = useState(false);
	const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
	const [backHovered, setBackHovered] = useState(false);
	const [addTierHovered, setAddTierHovered] = useState(false);
	const [addDetailHovered, setAddDetailHovered] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const titleRef = useRef<TextInput>(null);
	const conditionRef = useRef<TextInput>(null);
	const descriptionRef = useRef<TextInput>(null);
	const startingPriceRef = useRef<TextInput>(null);
	const locationRef = useRef<TextInput>(null);
	const pickupDescriptionRef = useRef<TextInput>(null);
	const shippingCostRef = useRef<TextInput>(null);
	const startDateRef = useRef<TextInput>(null);
	const endDateRef = useRef<TextInput>(null);
	const coverImage = images[0]?.uri;

	

	useEffect(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.multiple = true;
		input.onchange = (e) => {
			const files = Array.from((e.target as HTMLInputElement).files || []);
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = () => {
					setImages((prev) => [...prev, { id: nextId(), uri: String(reader.result), file }]);
				};
				reader.readAsDataURL(file);
			});
			input.value = '';
		};
		fileInputRef.current = input;
	}, []);

	if (isEditing && auction!.status === 'sold') {
		return (
			<ScrollView style={styles.page}>
				<View style={styles.headerBlock}>
					<AppText bold style={styles.pageTitle}>
						This listing can’t be edited
					</AppText>
					<AppText style={styles.pageSubtitle}>
						“{auction!.title}” has already sold, so its details are locked.
					</AppText>
					{onCancel && (
						<Pressable
							onPress={onCancel}
							onHoverIn={() => setBackHovered(true)}
							onHoverOut={() => setBackHovered(false)}
							style={{ marginTop: 16 }}
						>
							<AppText bold style={[sharedStyles.link, backHovered && sharedStyles.linkHover]}>
								Back to listings
							</AppText>
						</Pressable>
					)}
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView style={styles.page}>
			<View style={styles.contentRow}>
				<View style={styles.previewColumn}>
                    <View style={styles.headerBlock}>
                        <AppText bold style={styles.pageTitle}>
                            {isEditing ? 'Edit listing' : 'List an item'}
                        </AppText>
                        <AppText style={styles.pageSubtitle}>
                            {isEditing
								? 'Update the details below, then save your changes.'
								: "Add photos and details, then publish when you're ready."}
                        </AppText>
                    </View>
					<AppText style={styles.previewLabel}>Live preview</AppText>
					<View style={cardStyles.card}>
						<View style={cardStyles.cardMedia}>
							{coverImage ? (
								<Image source={{ uri: coverImage }} style={cardStyles.cardMediaImage} />
							) : (
								<FontAwesome6 name="gavel" style={cardStyles.cardPlaceholderIcon} />
							)}
						</View>
						<View style={cardStyles.cardBody}>
							<AppText bold style={cardStyles.cardTitle} numberOfLines={1}>
								{title || 'Untitled listing'}
							</AppText>
							<View style={cardStyles.infoRow}>
                                <View style={cardStyles.infoItem}>
                                    <FontAwesome6 name="user-large" style={cardStyles.infoItemIcon} />
                                    <AppText style={cardStyles.infoItemText}>{username}</AppText>
                                </View>
								<View style={cardStyles.infoItem}>
									<FontAwesome6 name="location-dot" style={cardStyles.infoItemIcon} />
									<AppText style={cardStyles.infoItemText}>
										{location || 'Location'}
									</AppText>
								</View>
                                <View style={cardStyles.infoItem}>
									<FontAwesome6 name="calendar-days" style={cardStyles.infoItemIcon} />
									<AppText style={cardStyles.infoItemText}>
                                        {formatDate(startDate)} – {formatDate(endDate)}
									</AppText>
								</View>
								{shippingAvailable ? (
									<View style={cardStyles.infoItem}>
										<FontAwesome6 name="truck" style={cardStyles.infoItemIcon} />
										<AppText style={cardStyles.infoItemText}>Shipping available</AppText>
									</View>
								) : null}
							</View>
							<AppText style={cardStyles.description} numberOfLines={2}>
								{description || 'Your description will show up here.'}
							</AppText>
							<View style={{ flex: 1 }} />
							<View style={cardStyles.priceBlock}>
								<AppText style={cardStyles.priceLabel}>Starting at</AppText>
								<AppText bold style={cardStyles.priceValue}>
									{formatPrice(startingPrice, currency)}
								</AppText>
							</View>
                            <View style={cardStyles.viewBtn}>
                                <AppText bold style={cardStyles.viewBtnText}>View listing</AppText>
                                <FontAwesome6 name="arrow-right" style={cardStyles.viewBtnIcon} />
                            </View>
						</View>
					</View>
				</View>

				<ScrollView style={styles.formColumn} contentContainerStyle={styles.formContent}>
					<View style={[styles.section, styles.sectionFirst]}>
						<AppText bold style={styles.sectionTitle}>
							Photos
						</AppText>
						<AppText style={styles.sectionHint}>
							The first photo becomes the cover image.
						</AppText>
						<View style={styles.photosRow}>
							{images.map((img) => (
								<View key={img.id} style={styles.photoThumb}>
									<Image source={{ uri: img.uri }} style={styles.photoThumbImage} />
									<Pressable
										style={styles.photoRemoveBtn}
										onPress={() => removeImage(img.id)}
									>
										<FontAwesome6 name="xmark" style={styles.photoRemoveIcon} />
									</Pressable>
								</View>
							))}
							{images.length < 8 && (
								<Pressable
									style={styles.addPhotoTile}
									onPress={() => fileInputRef.current?.click()}
								>
									<FontAwesome6 name="plus" style={styles.addPhotoIcon} />
									<AppText style={styles.addPhotoText}>Add</AppText>
								</Pressable>
							)}
						</View>
					</View>

					<View style={styles.section}>
						<AppText bold style={styles.sectionTitle}>
							Basic info
						</AppText>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Title
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'title' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => titleRef.current?.focus()}
							>
								<AppTextInput
									ref={titleRef}
									style={sharedStyles.inputControl}
									value={title}
									onChangeText={(t) => setTitle(t.slice(0, 100))}
									placeholder="e.g. Vintage brass desk lamp"
									onFocus={() => setFocusedField('title')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={[sharedStyles.field, categoryOpen && { zIndex: 20 }]}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Category
							</AppText>
							<View style={styles.dropdownWrap}>
								<Pressable
									style={[
										sharedStyles.inputWrap,
										styles.dropdownTrigger,
										categoryOpen && sharedStyles.inputWrapFocused,
									]}
									onPress={() => setCategoryOpen((v) => !v)}
								>
									<AppText
										style={[category && styles.dropdownValueText, styles.dropdownPlaceholder]}
									>
										{category || 'Choose a category'}
									</AppText>
									<FontAwesome6
										name={categoryOpen ? 'chevron-up' : 'chevron-down'}
										style={sharedStyles.inputIcon}
									/>
								</Pressable>
							</View>
                            {categoryOpen && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView>
                                        {CATEGORIES.map((option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.dropdownItem,
                                                    option === category && styles.dropdownItemActive,
                                                ]}
                                                onPress={() => {
                                                    setCategory(option);
                                                    setCategoryOpen(false);
                                                }}
                                            >
                                                <AppText
                                                    style={
                                                        option === category
                                                            ? [styles.dropdownItemText, styles.dropdownItemTextActive]
                                                            : styles.dropdownItemText
                                                    }
                                                >
                                                    {option}
                                                </AppText>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
						</View>

                        <View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Condition
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'condition' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => conditionRef.current?.focus()}
							>
								<AppTextInput
									ref={conditionRef}
									style={sharedStyles.inputControl}
									value={condition}
									onChangeText={setCondition}
									placeholder="e.g. Light use"
									onFocus={() => setFocusedField('condition')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Description
							</AppText>
							<Pressable
								style={[
									styles.textAreaWrap,
									focusedField === 'description' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => descriptionRef.current?.focus()}
							>
								<AppTextInput
									ref={descriptionRef}
									style={styles.textAreaControl}
									value={description}
									onChangeText={(t) => setDescription(t.slice(0, 1000))}
									placeholder="e.g. Vintage solid brass desk lamp in great working condition. Heavy base, adjustable shade, beautiful aged look. Perfect for a home office or study."
									multiline
									onFocus={() => setFocusedField('description')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>
					</View>

					<View style={styles.section}>
						<AppText bold style={styles.sectionTitle}>
							Pricing
						</AppText>

						<View style={styles.fieldRow}>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Starting price
								</AppText>
								<Pressable
									style={[
										sharedStyles.inputWrap,
										focusedField === 'startingPrice' && sharedStyles.inputWrapFocused,
									]}
									onPress={() => startingPriceRef.current?.focus()}
								>
									<AppText style={sharedStyles.inputPrefix}>{currency}</AppText>
									<AppTextInput
										ref={startingPriceRef}
										style={[sharedStyles.inputControl, isEditing && { opacity: 0.6 }]}
										value={startingPrice}
										onChangeText={setStartingPrice}
										placeholder="0"
										keyboardType="numeric"
										editable={!isEditing}
										onFocus={() => setFocusedField('startingPrice')}
										onBlur={() => setFocusedField(null)}
									/>
								</Pressable>
								{isEditing && (
									<AppText style={[styles.sectionHint, { marginTop: 4 }]}>
										Starting price can’t be changed once a listing is created.
									</AppText>
								)}
							</View>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Currency
								</AppText>
								<View style={styles.pillRow}>
									{CURRENCIES.map((option) => (
										<Pressable
											key={option}
											style={[
												styles.pill,
												option !== currency &&
													hoveredCurrency === option && { opacity: 0.75 },
												option === currency && styles.pillActive,
											]}
											onPress={() => setCurrency(option)}
											onHoverIn={() => setHoveredCurrency(option)}
											onHoverOut={() => setHoveredCurrency(null)}
										>
											<AppText
												style={
													option === currency
														? [styles.pillText, styles.pillTextActive]
														: styles.pillText
												}
											>
												{option}
											</AppText>
										</Pressable>
									))}
								</View>
							</View>
						</View>

						<View>
                            <AppText bold style={sharedStyles.fieldLabel}>
                                Bid increments
                            </AppText>
                            <View style={styles.dynamicColumnLabels}>
                                <AppText style={styles.dynamicColumnLabelText}>Min</AppText>
                                <AppText style={styles.dynamicColumnLabelText}>Max</AppText>
                                <AppText style={styles.dynamicColumnLabelText}>Increment</AppText>
                                <View style={{ width: 34 }} />
                            </View>
                            <View style={{ gap: 16 }}>
                                {increments.map((row) => (
                                    <View key={row.id} style={styles.dynamicRow}>
                                        <View
                                            style={[
                                                sharedStyles.inputWrap,
                                                styles.dynamicInputWrap,
                                                styles.fieldFlex,
                                                focusedField === `increment-${row.id}-min` &&
                                                    sharedStyles.inputWrapFocused,
                                            ]}
                                        >
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.min}
                                                onChangeText={(t) => updateIncrement(row.id, 'min', t)}
                                                placeholder="0"
                                                keyboardType="numeric"
                                                onFocus={() => setFocusedField(`increment-${row.id}-min`)}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                sharedStyles.inputWrap,
                                                styles.dynamicInputWrap,
                                                styles.fieldFlex,
                                                focusedField === `increment-${row.id}-max` &&
                                                    sharedStyles.inputWrapFocused,
                                            ]}
                                        >
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.max}
                                                onChangeText={(t) => updateIncrement(row.id, 'max', t)}
                                                placeholder="No limit"
                                                keyboardType="numeric"
                                                onFocus={() => setFocusedField(`increment-${row.id}-max`)}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                        </View>
                                        <View
                                            style={[
                                                sharedStyles.inputWrap,
                                                styles.dynamicInputWrap,
                                                styles.fieldFlex,
                                                focusedField === `increment-${row.id}-increment` &&
                                                    sharedStyles.inputWrapFocused,
                                            ]}
                                        >
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.increment}
                                                onChangeText={(t) => updateIncrement(row.id, 'increment', t)}
                                                placeholder="0"
                                                keyboardType="numeric"
                                                onFocus={() => setFocusedField(`increment-${row.id}-increment`)}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                        </View>
                                        <Pressable
                                            style={styles.dynamicRemoveBtn}
                                            onPress={() => removeIncrement(row.id)}
                                        >
                                            <FontAwesome6 name="xmark" style={styles.dynamicRemoveIcon} />
                                        </Pressable>
                                    </View>
                                ))}
                                <Pressable
                                    style={styles.addRowBtn}
                                    onPress={addIncrement}
                                    onHoverIn={() => setAddTierHovered(true)}
                                    onHoverOut={() => setAddTierHovered(false)}
                                >
                                    <AppText bold style={[sharedStyles.link, addTierHovered && sharedStyles.linkHover]}>
                                        + Add tier
                                    </AppText>
                                </Pressable>
                            </View>
						</View>
					</View>

					<View style={styles.section}>
						<AppText bold style={styles.sectionTitle}>
							Item details
						</AppText>
						<AppText style={styles.sectionHint}>
							Optional specs buyers care about, like storage or dimensions.
						</AppText>
						{details.map((row) => (
							<View key={row.id} style={styles.dynamicRow}>
								<View
									style={[
										sharedStyles.inputWrap,
										styles.dynamicInputWrap,
										styles.fieldFlex,
										focusedField === `detail-${row.id}-detail` && sharedStyles.inputWrapFocused,
									]}
								>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={row.detail}
										onChangeText={(t) => updateDetail(row.id, 'detail', t)}
										placeholder="Detail (e.g. Storage)"
										onFocus={() => setFocusedField(`detail-${row.id}-detail`)}
										onBlur={() => setFocusedField(null)}
									/>
								</View>
								<View
									style={[
										sharedStyles.inputWrap,
										styles.dynamicInputWrap,
										styles.fieldFlex,
										focusedField === `detail-${row.id}-info` && sharedStyles.inputWrapFocused,
									]}
								>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={row.info}
										onChangeText={(t) => updateDetail(row.id, 'info', t)}
										placeholder="Info (e.g. 256GB)"
										onFocus={() => setFocusedField(`detail-${row.id}-info`)}
										onBlur={() => setFocusedField(null)}
									/>
								</View>
								<Pressable style={styles.dynamicRemoveBtn} onPress={() => removeDetail(row.id)}>
									<FontAwesome6 name="xmark" style={styles.dynamicRemoveIcon} />
								</Pressable>
							</View>
						))}
						<Pressable
							style={styles.addRowBtn}
							onPress={addDetail}
							onHoverIn={() => setAddDetailHovered(true)}
							onHoverOut={() => setAddDetailHovered(false)}
						>
							<AppText bold style={[sharedStyles.link, addDetailHovered && sharedStyles.linkHover]}>
								+ Add detail
							</AppText>
						</Pressable>
					</View>

					<View style={styles.section}>
						<AppText bold style={styles.sectionTitle}>
							Location & shipping
						</AppText>

						<View style={[sharedStyles.field, { position: 'relative', zIndex: 10 }]}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Location
							</AppText>
							<Pressable
								style={[
									sharedStyles.inputWrap,
									focusedField === 'location' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => locationRef.current?.focus()}
							>
								<FontAwesome6 name="location-dot" style={sharedStyles.inputIcon} />
								<AppTextInput
									ref={locationRef}
									style={sharedStyles.inputControl}
									value={location}
									onChangeText={handleLocationChange}
									placeholder="Start typing an address…"
									onFocus={() => setFocusedField('location')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
							{locationVerified ? (
								<AppText style={{ color: colors.init, fontSize: 12, marginTop: 4 }}>
									<FontAwesome6 name="circle-check" /> Address verified
								</AppText>
							) : null}
							{locationLoading ? (
								<AppText style={[styles.sectionHint, { marginTop: 4 }]}>Searching…</AppText>
							) : null}
							{locationSuggestions.length > 0 ? (
								<View
									style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										marginTop: 4,
										backgroundColor: colors.bg,
										borderRadius: 8,
										borderWidth: 1,
										borderColor: colors.surface,
										overflow: 'hidden',
										zIndex: 20,
									}}
								>
									{locationSuggestions.map((suggestion) => (
										<Pressable
											key={suggestion.id}
											style={({ pressed }) => ({
												paddingVertical: 10,
												paddingHorizontal: 12,
												backgroundColor: pressed ? colors.surface : 'transparent',
											})}
											onPress={() => handleSelectLocation(suggestion)}
										>
											<AppText style={sharedStyles.inputControl}>{suggestion.text}</AppText>
										</Pressable>
									))}
								</View>
							) : null}
							<AppText style={[styles.sectionHint, { marginTop: 4 }]}>
								Address search by Photon — © OpenStreetMap contributors
							</AppText>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Pickup details
							</AppText>
							<Pressable
								style={[
									styles.textAreaWrap,
									focusedField === 'pickupDescription' && sharedStyles.inputWrapFocused,
								]}
								onPress={() => pickupDescriptionRef.current?.focus()}
							>
								<AppTextInput
									ref={pickupDescriptionRef}
									style={styles.textAreaControl}
									value={pickupDescription}
									onChangeText={setPickupDescription}
									placeholder="Where and when can buyers pick this up?"
									multiline
									onFocus={() => setFocusedField('pickupDescription')}
									onBlur={() => setFocusedField(null)}
								/>
							</Pressable>
						</View>

						<View style={styles.toggleRow}>
							<View>
								<AppText style={styles.toggleLabel}>Offer shipping</AppText>
								<AppText style={styles.toggleHint}>
									Turn this on if you're willing to ship instead of only meeting in person.
								</AppText>
							</View>
							<Switch
								value={shippingAvailable}
								onValueChange={setShippingAvailable}
								trackColor={{ false: colors.surface, true: colors.surface }}
                                thumbColor={shippingAvailable ? colors.init : colors.bg}
                                {...({ activeThumbColor: colors.init } as any)}
							/>
						</View>

						{shippingAvailable && (
							<View style={sharedStyles.field}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Shipping cost
								</AppText>
								<Pressable
									style={[
										sharedStyles.inputWrap,
										focusedField === 'shippingCost' && sharedStyles.inputWrapFocused,
									]}
									onPress={() => shippingCostRef.current?.focus()}
								>
									<AppText style={sharedStyles.inputPrefix}>{currency}</AppText>
									<AppTextInput
										ref={shippingCostRef}
										style={sharedStyles.inputControl}
										value={shippingCost}
										onChangeText={setShippingCost}
										placeholder="0"
										keyboardType="numeric"
										onFocus={() => setFocusedField('shippingCost')}
										onBlur={() => setFocusedField(null)}
									/>
								</Pressable>
							</View>
						)}
					</View>

					<View style={styles.section}>
						<AppText bold style={styles.sectionTitle}>
							Timing
						</AppText>
						<AppText style={styles.sectionHint}>
							Format: YYYY-MM-DDTHH:MM, e.g. 2025-06-01T18:00
						</AppText>
						<View style={styles.fieldRow}>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Bidding opens
								</AppText>
								<Pressable
									style={[
										sharedStyles.inputWrap,
										focusedField === 'startDate' && sharedStyles.inputWrapFocused,
									]}
									onPress={() => startDateRef.current?.focus()}
								>
									<FontAwesome6 name="clock" style={sharedStyles.inputIcon} />
									<AppTextInput
										ref={startDateRef}
										style={[sharedStyles.inputControl, auctionStarted && { opacity: 0.6 }]}
										value={startDate}
										onChangeText={setStartDate}
										placeholder="2025-06-01T18:00"
										editable={!auctionStarted}
										onFocus={() => setFocusedField('startDate')}
										onBlur={() => setFocusedField(null)}
									/>
								</Pressable>
								{auctionStarted && (
									<AppText style={[styles.sectionHint, { marginTop: 4 }]}>
										Bidding has already opened, so the start time is locked.
									</AppText>
								)}
							</View>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Bidding closes
								</AppText>
								<Pressable
									style={[
										sharedStyles.inputWrap,
										focusedField === 'endDate' && sharedStyles.inputWrapFocused,
									]}
									onPress={() => endDateRef.current?.focus()}
								>
									<FontAwesome6 name="clock" style={sharedStyles.inputIcon} />
									<AppTextInput
										ref={endDateRef}
										style={[sharedStyles.inputControl, auctionExpired && { opacity: 0.6 }]}
										value={endDate}
										onChangeText={setEndDate}
										placeholder="2025-06-08T18:00"
										editable={!auctionExpired}
										onFocus={() => setFocusedField('endDate')}
										onBlur={() => setFocusedField(null)}
									/>
								</Pressable>
								{auctionExpired && (
									<AppText style={[styles.sectionHint, { marginTop: 4 }]}>
										Bidding has already closed, so the end time is locked.
									</AppText>
								)}
							</View>
						</View>
					</View>

					<View style={styles.footer}>
						{error && <AppText style={sharedStyles.errorText}>{error}</AppText>}
						<Pressable
							style={({ pressed }) => [
								sharedStyles.submit,
								submitHovered && !pressed && sharedStyles.submitHover,
								pressed && sharedStyles.submitPressed,
								submitting && sharedStyles.submitDisabled,
							]}
							onPress={handleSubmit}
							onHoverIn={() => setSubmitHovered(true)}
							onHoverOut={() => setSubmitHovered(false)}
							disabled={submitting}
						>
							<AppText bold style={sharedStyles.submitText}>
								{uploadingImages
									? 'Uploading photos…'
									: submitting
										? isEditing
											? 'Saving…'
											: 'Publishing…'
										: isEditing
											? 'Save changes'
											: 'Publish listing'}
							</AppText>
						</Pressable>
						{onCancel && (
							<Pressable
								onPress={handleCancel}
								onHoverIn={() => setCancelHovered(true)}
								onHoverOut={() => setCancelHovered(false)}
								style={{ alignSelf: 'center' }}
							>
								<AppText bold style={[sharedStyles.link, cancelHovered && sharedStyles.linkHover]}>
									Cancel
								</AppText>
							</Pressable>
						)}
						{isEditing && !auctionExpired && (
							<Pressable
								onPress={handleDelete}
								onHoverIn={() => setDeleteHovered(true)}
								onHoverOut={() => setDeleteHovered(false)}
								disabled={deleting}
								style={{ alignSelf: 'center', marginTop: 4 }}
							>
								<AppText
									bold
									style={[
										sharedStyles.link,
										{ color: '#dc2626' },
										deleteHovered && { opacity: 0.75 },
									]}
								>
									{deleting ? 'Deleting…' : 'Delete listing'}
								</AppText>
							</Pressable>
						)}
					</View>
				</ScrollView>
			</View>
		</ScrollView>
	);
}
