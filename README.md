# Social Data

The social system now auto-discovers players and record videos from the demon list itself, then enriches them with YouTube metadata when an API key is available.

## Primary files

- `social/config.json`
  - Controls API key use, cache lifetimes, discovery limits, future-record ingestion, and lazy channel-upload loading.
- `social/profile-overrides.json`
  - One place for manual profile overrides, YouTube handles/channel IDs, community posts, featured videos, and manual-only profiles.
- `social/video-overrides.json`
  - One place for per-video stat overrides, comments, categories, and custom videos.

## Automatic discovery

- All verifier and record videos with YouTube links are discovered dynamically from `data/_list.json` and the level JSON files.
- Future Demon records with YouTube links are also discovered dynamically from `data/_future_list.json`.
- Player profiles are generated from those discovered uploads.
- If a YouTube API key is present, the site fetches:
  - exact video titles
  - thumbnails
  - views
  - likes
  - comment counts
  - channel avatars
  - subscriber counts
  - uploads playlist IDs for lazy profile-page syncing

## Lazy channel loading

- The main feed loads from discovered demon-list videos plus any cached channel uploads.
- When a player profile page opens, the app refreshes that player's recent channel uploads and caches them locally.
- If no API key is available, the profile page still tries to resolve the player's YouTube channel identity from their recent video embeds so avatar and channel-link fallbacks can improve over time.
- Cached uploads are reused on later visits to avoid repeated API calls.

## Avatar behavior

- Best result: add a YouTube Data API key in `social/config.json` and let the app use the exact `channels` thumbnail from YouTube.
- No API key: set `youtube.channelId` or `youtube.handle` in `social/profile-overrides.json` for exact channel linking and a better avatar fallback.
- If neither is available, the site falls back to generated avatars until it can infer a channel reference from cached video metadata.

## Override priority

Manual overrides always win over fetched data.

- Profile overrides beat fetched channel names, bios, subscriber counts, verification state, and socials.
- Video overrides beat fetched or simulated titles, stats, comments, and category flags.
- Custom videos and custom profiles let you add content that is not discoverable automatically.

## Legacy support

The older `profiles/*.json` and `videos/*.json` files are still read for compatibility, but they are no longer required for scaling the system.
