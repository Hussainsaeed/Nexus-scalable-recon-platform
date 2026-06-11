import axios from 'axios';

export async function getAsnInfo(ip: string) {
  try {
    const { data } = await axios.get(
      `http://ip-api.com/json/${ip}`
    );

    return {
      isp: data.isp || null,
      organization: data.org || null,
      asn: data.as || null,
      country: data.country || null,
    };
  } catch (error) {
    console.error('ASN LOOKUP ERROR:', error);

    return {
      isp: null,
      organization: null,
      asn: null,
      country: null,
    };
  }
}