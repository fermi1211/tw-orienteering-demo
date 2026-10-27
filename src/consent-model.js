export const DEFAULT_SIGNUP_NOTICE = '示範註冊告知，正式內容待主辦單位提供。';
export const DEFAULT_ACTIVITY_NOTICE = '示範活動條款，正式內容待主辦單位提供。';

export function activityTermsText(event) {
  const terms = event?.terms || [];
  return terms.length ? terms.map(term => `${term.title}\n${term.content}`).join('\n\n') : DEFAULT_ACTIVITY_NOTICE;
}

export function readingAtEnd({scrollTop, scrollHeight, clientHeight}) {
  return [scrollTop, scrollHeight, clientHeight].every(Number.isFinite)
    && clientHeight > 0 && scrollHeight > 0
    && scrollTop >= 0 && scrollTop + clientHeight >= scrollHeight - 2;
}

export function consentError(read, accepted) {
  if (!read) return '請閱讀完條款';
  return accepted ? '' : '請勾選同意條款';
}
