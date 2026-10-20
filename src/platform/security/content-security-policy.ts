export type ContentSecurityPolicyInput = Readonly<{
  nonce: string;
  development: boolean;
  production: boolean;
  analytics: Readonly<{ ga4: boolean; clarity: boolean }>;
  turnstile: boolean;
  vanguard?: { uploadOrigin?: string };
}>;

export function vanguardR2UploadOrigin(
  accountId: string | undefined,
  privateBucket: string | undefined,
): string | undefined {
  const account = accountId?.trim() ?? "";
  const bucket = privateBucket?.trim() ?? "";
  if (!/^[a-f0-9]{32}$/.test(account)) return undefined;
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) return undefined;
  return `https://${bucket}.${account}.r2.cloudflarestorage.com`;
}

export function buildContentSecurityPolicy(input: ContentSecurityPolicyInput): string {
  if (!input.nonce.trim()) throw new Error("CSP nonce is required");

  const turnstileOrigin = "https://challenges.cloudflare.com";
  const cmpScriptOrigins = [
    "https://pagead2.googlesyndication.com",
    "https://fundingchoicesmessages.google.com",
    "https://*.adtrafficquality.google",
  ];
  const cmpConnectOrigins = [
    "https://pagead2.googlesyndication.com",
    "https://fundingchoicesmessages.google.com",
    "https://*.adtrafficquality.google",
    "https://adtrafficquality.google",
    "https://googleads.g.doubleclick.net",
    "https://*.google.com",
  ];
  const cmpFrameOrigins = [
    "https://fundingchoicesmessages.google.com",
    "https://googleads.g.doubleclick.net",
    "https://*.adtrafficquality.google",
    "https://*.google.com",
  ];
  const cmpImageOrigins = [
    "https://pagead2.googlesyndication.com",
    "https://fundingchoicesmessages.google.com",
    "https://*.adtrafficquality.google",
    "https://adtrafficquality.google",
    "https://*.google.com",
    "https://googleads.g.doubleclick.net",
  ];

  const scriptSources = [
    "'self'",
    `'nonce-${input.nonce}'`,
    ...(input.development ? ["'unsafe-eval'"] : []),
    ...(input.vanguard ? ["'wasm-unsafe-eval'"] : []),
    ...cmpScriptOrigins,
    ...(input.analytics.ga4 ? ["https://www.googletagmanager.com"] : []),
    ...(input.analytics.clarity ? ["https://www.clarity.ms", "https://scripts.clarity.ms"] : []),
    ...(input.turnstile ? [turnstileOrigin] : []),
  ];
  const connectSources = [
    "'self'",
    ...(input.vanguard?.uploadOrigin ? [input.vanguard.uploadOrigin] : []),
    ...cmpConnectOrigins,
    ...(input.analytics.ga4
      ? ["https://www.google-analytics.com", "https://region1.google-analytics.com"]
      : []),
    ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
    ...(input.turnstile ? [turnstileOrigin] : []),
  ];
  const imageSources = [
    "'self'",
    "data:",
    "blob:",
    "https://media.tierlistbase.com",
    ...cmpImageOrigins,
    ...(input.analytics.ga4 ? ["https://www.google-analytics.com"] : []),
    ...(input.analytics.clarity ? ["https://*.clarity.ms"] : []),
  ];
  const frameSources = [
    "'self'",
    ...cmpFrameOrigins,
    ...(input.turnstile ? [turnstileOrigin] : []),
  ];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    `frame-src ${frameSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    ...(input.production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
