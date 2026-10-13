import assembly from '../../public/assets/frame-previews-v1/assembly/manifest.json';
import finale from '../../public/assets/frame-previews-v1/finale/manifest.json';
import type { FramePreviewSpec } from './frame-preview';

// Bundled metadata avoids a manifest roundtrip before downloading the overview.
export const assemblyPreview: FramePreviewSpec = assembly;
export const finalePreview: FramePreviewSpec = finale;
