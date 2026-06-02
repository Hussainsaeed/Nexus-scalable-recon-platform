import dns from "dns/promises";

export const runDnsLookup = async (
  target: string
) => {

  const ipv4 =
    await dns.resolve4(target);

  let ipv6: string[] = [];

  try {

    ipv6 =
      await dns.resolve6(target);

  } catch {}

  return {
    ipv4,
    ipv6,
  };
};