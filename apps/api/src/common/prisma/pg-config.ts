function isLocalDatabaseUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function resolveDatabaseUrl(
  url = process.env.DATABASE_URL,
): string {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  if (isLocalDatabaseUrl(url)) {
    return url;
  }

  if (/[?&]sslmode=/i.test(url)) {
    return url.replace(/([?&]sslmode=)[^&]*/i, '$1no-verify');
  }

  return url.includes('?')
    ? `${url}&sslmode=no-verify`
    : `${url}?sslmode=no-verify`;
}

export function getPrismaPgConfig(): {
  connectionString: string;
  ssl?: { rejectUnauthorized: false };
} {
  const connectionString = resolveDatabaseUrl();

  if (isLocalDatabaseUrl(connectionString)) {
    return { connectionString };
  }

  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
  };
}
