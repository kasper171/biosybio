export type { HotelPlatform, HotelProfileData, HotelFetchResult } from "@/lib/hotel/types";
export { HOTEL_FETCH_MESSAGES } from "@/lib/hotel/types";
export { HABBO_HOTELS, getHabboHotel, normalizeHabboHotelDomain, getHotelPlatformLabel } from "@/lib/hotel/hotels";
export { buildHotelAvatarUrl, HOTEL_AVATAR_QUERY } from "@/lib/hotel/avatar";
export {
  getHotelCardLayoutFromProfile,
  resolveHotelLayoutForViewport,
  getHotelCardFrameStyle,
  getHotelCardBorderRadius,
  getHotelBesideFrameStyle,
  getHotelBelowFrameStyle,
  getHotelBesideColumnDimensions,
  getHotelBesideColumnWidth,
  getMainCardDimensions,
  getHotelBesideSlotHeight,
  HOTEL_BESIDE_GAP_PX,
  HOTEL_BELOW_GAP_PX,
  type HotelBesideColumnDimensions,
  type HotelBesideSlot,
  type HotelBelowSlot,
  HOTEL_AVATAR_SLOT,
  HOTEL_CARD_PLACEMENT_LABELS,
  HOTEL_CARD_ROW_LABELS,
  HOTEL_CARD_SHAPE_LABELS,
  HOTEL_CARD_SIZE_LABELS,
  type HotelCardLayoutConfig,
  type HotelCardPlacement,
  type HotelCardRow,
  type HotelCardShape,
  type HotelCardSize,
} from "@/lib/hotel/hotel-card-layout";
export {
  profileToHabboData,
  profileToHabbletData,
  listHotelConnections,
  profileToHotelData,
  habboDataToProfilePatch,
  habbletDataToProfilePatch,
  hotelDataToProfilePatch,
  clearHabboProfilePatch,
  clearHabbletProfilePatch,
  clearHotelProfilePatch,
  isHabboConnected,
  isHabbletConnected,
  isHotelConnected,
} from "@/lib/hotel/profile-hotel";
export { fetchHotelProfile } from "@/lib/hotel/hotel-service";
export { clearHotelCache } from "@/lib/hotel/cache";
