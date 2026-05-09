import type { Env } from "../env";

/**
 * 토스 user 정보 (name, phone 등) 복호화.
 *
 * 인코딩: base64( IV(12) || ciphertext || authTag(16) )  — AES-256-GCM
 * 키와 AAD 는 토스 콘솔에서 이메일로 받아 wrangler secret 으로 등록:
 *  - `TOSS_USER_INFO_KEY`: base64-encoded 32-byte 키
 *  - `TOSS_USER_INFO_AAD`: AAD 문자열
 *
 * 둘 중 하나라도 누락되거나 복호화 실패 시 null 반환 (호출자가 fallback 처리).
 */
export async function decryptTossUserField(
  env: Env,
  encrypted: string | null | undefined,
): Promise<string | null> {
  if (!encrypted) return null;
  if (!env.TOSS_USER_INFO_KEY || !env.TOSS_USER_INFO_AAD) return null;
  try {
    const keyBytes = base64ToBytes(env.TOSS_USER_INFO_KEY);
    const data = base64ToBytes(encrypted);
    if (data.byteLength < 12 + 16) return null;
    const iv = data.subarray(0, 12);
    const ciphertextWithTag = data.subarray(12);

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes as BufferSource,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    const aad = new TextEncoder().encode(env.TOSS_USER_INFO_AAD);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource, additionalData: aad, tagLength: 128 },
      key,
      ciphertextWithTag as BufferSource,
    );
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.warn("[toss-decrypt] failed");
    return null;
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
