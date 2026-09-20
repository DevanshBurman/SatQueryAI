# Real recording samples

These are actual Copernicus Sentinel observations, not generated images.

- Location: western Upper Lake shoreline, Bhopal, India.
- Optical: Sentinel-2 L2A, 6 May and 2 November 2021.
- Radar: Sentinel-1 RTC VV/VH, 6 May 2021.
- Source item IDs, acquisition dates and permanent catalog links: `manifest.json`.
- Accessed via Microsoft Planetary Computer on 20 September 2026.
- Optical processing: 256 × 256 crop at 10 m, pre-baseline-04 DN divided by 10,000. Bands: blue, green, red, NIR. Zero nodata becomes NaN.
- Radar processing: bilinear resampling of terrain-corrected VV/VH to the same EPSG:32643 bounds/grid, then 10 log10 conversion to dB. Resampling does not improve native resolution. Pixel-grid compatibility is tested; independent geolocation accuracy is not claimed.
- Not a flood-ground-truth dataset. This shoreline includes vegetation and seasonal inundation. NDWI candidates are threshold-sensitive, and cloud/shadow masks are not applied. The earlier crop has a very small NDWI water baseline: use absolute area and visual evidence, not the percentage increase, in a presentation.

Reproduction: run `python scripts/prepare_sentinel.py`, then `python scripts/prepare_sar.py`. Downloads use public read-only APIs; no AWS credentials are used for source imagery. Do not replace radar with a grayscale optical image.

Sources: [Sentinel-2 L2A](https://planetarycomputer.microsoft.com/dataset/sentinel-2-l2a), [Sentinel-1 RTC](https://planetarycomputer.microsoft.com/dataset/sentinel-1-rtc), [public data-access documentation](https://planetarycomputer.microsoft.com/docs/concepts/sas/).
