// function isLocalDatabaseUrl(url: string): boolean {
//   return /localhost|127\.0\.0\.1/i.test(url);
// }

// export function resolveDatabaseUrl(
//   url = process.env.DATABASE_URL,
// ): string {
//   if (!url) {
//     throw new Error('DATABASE_URL is not set');
//   }

//   if (isLocalDatabaseUrl(url)) {
//     return url;
//   }

//   if (/[?&]sslmode=/i.test(url)) {
//     return url.replace(/([?&]sslmode=)[^&]*/i, '$1no-verify');
//   }

//   return url.includes('?')
//     ? `${url}&sslmode=no-verify`
//     : `${url}?sslmode=no-verify`;
// }

// export function getPrismaPgConfig(): {
//   connectionString: string;
//   ssl?: { rejectUnauthorized: false };
// } {
//   const connectionString = resolveDatabaseUrl();

//   if (isLocalDatabaseUrl(connectionString)) {
//     return { connectionString };
//   }

//   return {
//     connectionString,
//     ssl: { rejectUnauthorized: false },
//   };
// }

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

  // Strip sslmode entirely rather than setting it: node-postgres parses
  // sslmode from the connection string itself and, when present, that
  // parsed value silently wins over an explicit `ssl` option passed to
  // the Pool/adapter. Leaving it in caused rejectUnauthorized to end up
  // back at its default `true` in production, despite the explicit
  // `ssl: { rejectUnauthorized: false }` below.
  const withoutSslMode = url.replace(/([?&])sslmode=[^&]*&?/i, '$1');

  return withoutSslMode.replace(/[?&]$/, '');
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