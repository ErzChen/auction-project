import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Switch, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { AppText } from '../components/AppText';
import { AppTextInput } from '../components/AppTextInput';
import { useAuthContext } from '../context/AuthContext';
import { createPageStyles as styles } from '../styles/createPage';
import { sharedStyles } from '../styles/shared';
import { auctionListingsStyles as cardStyles } from '../styles/auctionListings';
import { colors } from '../constants/theme';
import { formatDate, formatPrice } from '../lib/library';

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

export default function CreatePage({ onCreated }: { onCreated?: (auction: any) => void }) {
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

		const payload = {
			user_id: userId,
			starting_price: Number(startingPrice),
			current_price: Number(startingPrice),
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
			image_paths: JSON.stringify(uploadedPaths),
			location: location.trim(),
			shipping_pickup_description: pickupDescription.trim(),
			is_shipping_available: shippingAvailable ? 1 : 0,
			shipping_cost: shippingAvailable ? Number(shippingCost) : null,
			start_time: startDate,
			end_time: endDate,
		};

		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/auctions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY,
				},
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.message || 'Something went wrong');
				return;
			}
			const auction = await res.json();
			onCreated?.(auction);
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

    async function uploadImages(): Promise<string[]> {
		const formData = new FormData();
		images.forEach((img) => formData.append('images', img.file));
		const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/api/uploads/auctions`, {
			method: 'POST',
			headers: {
				'X-Auction-Application-Key': process.env.EXPO_PUBLIC_SECRET_KEY as string,
			},
			body: formData,
		});
		if (!res.ok) {
			throw new Error('Photo upload failed');
		}
		const data = await res.json();
		return data.paths as string[];
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

	const { id: userId, username } = useAuthContext().user;
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [condition, setCondition] = useState('');
	const [category, setCategory] = useState('');
	const [categoryOpen, setCategoryOpen] = useState(false);
	const [images, setImages] = useState<{ id: string; uri: string; file: File }[]>([]);
	const [uploadingImages, setUploadingImages] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [startingPrice, setStartingPrice] = useState('');
	const [currency, setCurrency] = useState('USD');
	const [increments, setIncrements] = useState([emptyIncrement()]);
	const [details, setDetails] = useState([emptyDetail()]);
	const [location, setLocation] = useState('');
	const [locationVerified, setLocationVerified] = useState(false);
	const [locationSuggestions, setLocationSuggestions] = useState<
		{ id: string; text: string }[]
	>([]);
	const [locationLoading, setLocationLoading] = useState(false);
	const locationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [pickupDescription, setPickupDescription] = useState('');
	const [shippingAvailable, setShippingAvailable] = useState(false);
	const [shippingCost, setShippingCost] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitHovered, setSubmitHovered] = useState(false);
	const previewImage = images[0]?.uri;

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

	return (
		<ScrollView style={styles.page}>
			

			<View style={styles.contentRow}>
				<View style={styles.previewColumn}>
                    <View style={styles.headerBlock}>
                        <AppText bold style={styles.pageTitle}>
                            List an item
                        </AppText>
                        <AppText style={styles.pageSubtitle}>
                            Add photos and details, then publish when you're ready.
                        </AppText>
                    </View>
					<AppText style={styles.previewLabel}>Live preview</AppText>
					<View style={cardStyles.card}>
						<View style={cardStyles.cardMedia}>
							{previewImage ? (
								<Image source={{ uri: previewImage }} style={cardStyles.cardMediaImage} />
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

				{/* form */}
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
							<View style={sharedStyles.inputWrap}>
								<AppTextInput
									style={sharedStyles.inputControl}
									value={title}
									onChangeText={(t) => setTitle(t.slice(0, 100))}
									placeholder="e.g. Vintage brass desk lamp"
								/>
							</View>
						</View>

						<View style={[sharedStyles.field, categoryOpen && { zIndex: 20 }]}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Category
							</AppText>
							<View style={styles.dropdownWrap}>
								<Pressable
									style={[sharedStyles.inputWrap, styles.dropdownTrigger]}
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
							<View style={sharedStyles.inputWrap}>
								<AppTextInput
									style={sharedStyles.inputControl}
									value={condition}
									onChangeText={setCondition}
									placeholder="e.g. Light use"
								/>
							</View>
						</View>

						<View style={sharedStyles.field}>
							<AppText bold style={sharedStyles.fieldLabel}>
								Description
							</AppText>
							<View style={styles.textAreaWrap}>
								<AppTextInput
									style={styles.textAreaControl}
									value={description}
									onChangeText={(t) => setDescription(t.slice(0, 1000))}
									placeholder="e.g. Vintage solid brass desk lamp in great working condition. Heavy base, adjustable shade, beautiful aged look. Perfect for a home office or study."
									multiline
								/>
							</View>
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
								<View style={sharedStyles.inputWrap}>
									<AppText style={sharedStyles.inputPrefix}>{currency}</AppText>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={startingPrice}
										onChangeText={setStartingPrice}
										placeholder="0"
										keyboardType="numeric"
									/>
								</View>
							</View>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Currency
								</AppText>
								<View style={styles.pillRow}>
									{CURRENCIES.map((option) => (
										<Pressable
											key={option}
											style={[styles.pill, option === currency && styles.pillActive]}
											onPress={() => setCurrency(option)}
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
                                        <View style={[sharedStyles.inputWrap, styles.dynamicInputWrap, styles.fieldFlex]}>
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.min}
                                                onChangeText={(t) => updateIncrement(row.id, 'min', t)}
                                                placeholder="0"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={[sharedStyles.inputWrap, styles.dynamicInputWrap, styles.fieldFlex]}>
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.max}
                                                onChangeText={(t) => updateIncrement(row.id, 'max', t)}
                                                placeholder="No limit"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={[sharedStyles.inputWrap, styles.dynamicInputWrap, styles.fieldFlex]}>
                                            <AppTextInput
                                                style={sharedStyles.inputControl}
                                                value={row.increment}
                                                onChangeText={(t) => updateIncrement(row.id, 'increment', t)}
                                                placeholder="0"
                                                keyboardType="numeric"
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
                                <Pressable style={styles.addRowBtn} onPress={addIncrement}>
                                    <AppText bold style={sharedStyles.link}>
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
								<View style={[sharedStyles.inputWrap, styles.dynamicInputWrap, styles.fieldFlex]}>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={row.detail}
										onChangeText={(t) => updateDetail(row.id, 'detail', t)}
										placeholder="Detail (e.g. Storage)"
									/>
								</View>
								<View style={[sharedStyles.inputWrap, styles.dynamicInputWrap, styles.fieldFlex]}>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={row.info}
										onChangeText={(t) => updateDetail(row.id, 'info', t)}
										placeholder="Info (e.g. 256GB)"
									/>
								</View>
								<Pressable style={styles.dynamicRemoveBtn} onPress={() => removeDetail(row.id)}>
									<FontAwesome6 name="xmark" style={styles.dynamicRemoveIcon} />
								</Pressable>
							</View>
						))}
						<Pressable style={styles.addRowBtn} onPress={addDetail}>
							<AppText bold style={sharedStyles.link}>
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
							<View style={sharedStyles.inputWrap}>
								<FontAwesome6 name="location-dot" style={sharedStyles.inputIcon} />
								<AppTextInput
									style={sharedStyles.inputControl}
									value={location}
									onChangeText={handleLocationChange}
									placeholder="Start typing an address…"
								/>
							</View>
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
							<View style={styles.textAreaWrap}>
								<AppTextInput
									style={styles.textAreaControl}
									value={pickupDescription}
									onChangeText={setPickupDescription}
									placeholder="Where and when can buyers pick this up?"
									multiline
								/>
							</View>
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
								<View style={sharedStyles.inputWrap}>
									<AppText style={sharedStyles.inputPrefix}>{currency}</AppText>
									<AppTextInput
										style={sharedStyles.inputControl}
										value={shippingCost}
										onChangeText={setShippingCost}
										placeholder="0"
										keyboardType="numeric"
									/>
								</View>
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
								<View style={sharedStyles.inputWrap}>
									<FontAwesome6 name="clock" style={sharedStyles.inputIcon} />
									<AppTextInput
										style={sharedStyles.inputControl}
										value={startDate}
										onChangeText={setStartDate}
										placeholder="2025-06-01T18:00"
									/>
								</View>
							</View>
							<View style={[sharedStyles.field, styles.fieldFlex]}>
								<AppText bold style={sharedStyles.fieldLabel}>
									Bidding closes
								</AppText>
								<View style={sharedStyles.inputWrap}>
									<FontAwesome6 name="clock" style={sharedStyles.inputIcon} />
									<AppTextInput
										style={sharedStyles.inputControl}
										value={endDate}
										onChangeText={setEndDate}
										placeholder="2025-06-08T18:00"
									/>
								</View>
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
								{uploadingImages ? 'Uploading photos…' : submitting ? 'Publishing…' : 'Publish listing'}
							</AppText>
						</Pressable>
					</View>
				</ScrollView>
			</View>
		</ScrollView>
	);
}
