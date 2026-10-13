// Shared by the horizontal track and its four photographic studies.
// Each stop has its own scroll interval; travelling happens between stops.
export const materialStops = [0, .28, .56, .84] as const;
export const materialStudyLength = .16;
export const materialTravelLength = .12;
// The surface study leads into the crown view within the same unpinned film.
export const craftSurfaceLength = .62;
export const storyAssetPath = '/assets/motion-story-v1';
export const storyFrames = { movement: 48, sapphire: 18, anthracite: 18, rubber: 18 } as const;
