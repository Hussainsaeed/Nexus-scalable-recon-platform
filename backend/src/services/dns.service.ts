import dns from "dns/promises";

export const runDnsLookup = async (
  target: string
) => {

  const ipv4 =
    await dns.resolve4(target);

  let ipv6: string[] = [];
  let mx: any[] = [];
let txt: string[][] = [];
let ns: string[] = [];
let cname: string[] = [];
let spf = false;
let dmarc = false;
let dmarcPolicy = null;
let dkim = false;

  try {

    ipv6 =
      await dns.resolve6(target);

  } catch {}

  try {
  mx = await dns.resolveMx(target);
} catch {}

try {
  txt = await dns.resolveTxt(target);
} catch {}

try {
  ns = await dns.resolveNs(target);
} catch {}

try {
  cname = await dns.resolveCname(target);
} catch {}


for (const record of txt) {
  const value = record.join(" ");

  if (
    value.toLowerCase().startsWith("v=spf1")
  ) {
    spf = true;
    break;
  }
}

try {

  const dmarcTxt =
    await dns.resolveTxt(
      `_dmarc.${target}`
    );

  const record =
    dmarcTxt
      .flat()
      .join('');

  if (
    record.includes(
      'v=DMARC1'
    )
  ) {

    dmarc = true;

    const match =
      record.match(
        /p=([^;]+)/i
      );

    if (match) {
      dmarcPolicy =
        match[1];
    }
  }

} catch {}

const selectors = [
  'default',
  'selector1',
  'selector2',
];

for (const selector of selectors) {

  try {

    const dkimTxt =
      await dns.resolveTxt(
        `${selector}._domainkey.${target}`
      );

    const record =
      dkimTxt
        .flat()
        .join('');

    if (
      record.includes('v=DKIM1')
    ) {

      dkim = true;
      break;

    }

  } catch {}

}

return {
  ipv4,

  ipv6,

  mx,

  txt,

  ns,

  cname,

  spf,

  dmarc,

  dmarcPolicy,

  dkim,
  
};

};