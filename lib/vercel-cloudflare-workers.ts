/**
 * Vercel does not expose Cloudflare D1 or R2 bindings. This build-time shim
 * keeps the public storefront deployable while CMS routes report their
 * existing "unavailable" response until equivalent Vercel storage is bound.
 */
export const env = {};
