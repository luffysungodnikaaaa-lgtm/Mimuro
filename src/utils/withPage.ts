export function withPage(params: string, page: number) {
  if (page <= 1) {
    return params;
  }

  const separator = params.includes('?') ? '&' : '?';
  return `${params}${separator}page=${page}`;
}
