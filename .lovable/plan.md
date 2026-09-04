# Fix missing property images

## What's happening

Photos uploaded by agents are saved correctly (all 3 photos in the database have a stored file), but the listing cards and the property page look for two other fields — a "thumbnail" and a "medium" version — that nothing ever fills in. Those are always empty, so every listing falls back to the grey placeholder icon.

There is a second issue behind it: even where a photo is referenced, the pages use the raw stored file name as the image address instead of the real public web address of the file, so it would not load anyway.

## The fix

1. Use the actual uploaded photo everywhere instead of the never-filled thumbnail/medium fields.
2. Convert the stored file reference into its full public web address before showing it, the same way the upload preview already does.
3. Apply this in all four places images appear: the home search results, the feed, the saved/favourites list, and the property detail page.
4. Keep the placeholder icon as the fallback when a listing genuinely has no photos.

## Technical details

- `property_photos.thumb_path` / `med_path` are null for all rows; only `storage_path` is populated by `storageService.uploadPropertyImages`.
- Change the photo selects in `propertyService` (search, feed, saved, detail list queries) and `savedPropertyService` to fetch `storage_path, ordering` instead of `thumb_path`.
- In `useFeed`, `useProperties` (search + agent listings) and `useSavedProperties`, map the first photo (lowest `ordering`) through `storageService.getPublicUrl(storage_path)` into the card image field.
- `PropertyCard` and `DashboardPropertyCard` render that resolved URL directly; `PropertyImageGallery` switches from `photos[0].med_path` to `getPublicUrl(photos[0].storage_path)`.
- Bucket `property-images` is public, so `getPublicUrl` links resolve without a signed URL.

Optional follow-up (not included): generate real thumbnail/medium sizes on upload for faster loading.
