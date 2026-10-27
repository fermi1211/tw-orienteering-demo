const trimmed = value => typeof value === 'string' ? value.trim() : '';

/** Format validation only; mailbox ownership is handled by the email verification flow. */
export function emailError(value) {
  const email = trimmed(value);
  if (!email) return '請填寫 Email。';
  const invalid = 'Email 格式不正確，例如 name@example.com。';
  if (email.length > 254) return invalid;
  const parts = email.split('@');
  if (parts.length !== 2) return invalid;
  const [local, domain] = parts;
  if (!local || local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return invalid;
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return invalid;
  if (!/^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels.at(-1))) return invalid;
  return '';
}

export function mobileError(value, label = '手機號碼') {
  const phone = trimmed(value);
  if (!phone) return `請填寫${label}。`;
  return /^09[0-9]{8}$/.test(phone) ? '' : `${label}必須是 09 開頭的 10 位數字，不可含空格或符號。`;
}
