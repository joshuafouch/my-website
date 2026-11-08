/**
 * The largest file an admin upload accepts. Uploads go through a Vercel Function, which rejects a
 * request body over 4.5 MB before the form action even runs, so stay under that with room for the
 * other form fields. Shared by the browser-side checks and the server-side ones.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '4 MB';
