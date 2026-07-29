export const HOSPITAL_LOCATION = {
  name: 'SmartCare Central Hospital',
  latitude: 40.7580,
  longitude: -73.9855,
  radiusMeters: 500,
};

const toRadians = (value) => (value * Math.PI) / 180;

export const getDistanceInMeters = (from, to) => {
  if (!from || !to || from.latitude == null || from.longitude == null || to.latitude == null || to.longitude == null) {
    return null;
  }

  const earthRadius = 6371000;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

export const isAttendanceEligible = (currentLocation, hospitalLocation = HOSPITAL_LOCATION) => {
  if (!currentLocation || currentLocation.latitude == null || currentLocation.longitude == null) {
    return {
      eligible: false,
      reason: 'Location access is required before attendance can be recorded.',
      distanceInMeters: null,
    };
  }

  const distanceInMeters = getDistanceInMeters(currentLocation, hospitalLocation);

  if (distanceInMeters == null) {
    return {
      eligible: false,
      reason: 'Unable to calculate your location. Please try again.',
      distanceInMeters: null,
    };
  }

  const eligible = distanceInMeters <= hospitalLocation.radiusMeters;

  return {
    eligible,
    distanceInMeters,
    reason: eligible
      ? `You are ${Math.round(distanceInMeters)}m from ${hospitalLocation.name}. Attendance has been approved.`
      : `You are ${Math.round(distanceInMeters)}m away from ${hospitalLocation.name}. Attendance is not valid outside the hospital zone.`,
  };
};
