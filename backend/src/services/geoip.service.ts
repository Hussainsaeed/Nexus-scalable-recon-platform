import geoip from "geoip-lite";

export const getGeoIpInfo = (
  ip: string
) => {

  const geo =
    geoip.lookup(ip);

  if (!geo) {

    return {
      country: null,
      region: null,
      city: null,
      timezone: null,
    };
  }

  return {

    country:
      geo.country,

    region:
      geo.region,

    city:
      geo.city,

    timezone:
      geo.timezone,
  };
};