import postgres from 'postgres'

export type DB = ReturnType<typeof createPostgresPool>

export const createPostgresPool = function (url: string) {
    const sql = postgres(url)
    return sql
}