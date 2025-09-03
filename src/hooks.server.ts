import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { building } from '$app/environment';

if (!building) {
	check_env_api_urls();
	check_env_impressum();
}

function check_env_api_urls() {
	if (!(env.CD_API_URL && env.MENSA_API_URL)) {
		console.error(
			'One or more environment variables are missing:\n\nCD_API_URL\nMENSA_API_URL\n\n'
		);
		process.exit(1);
	}
}

function check_env_impressum() {
	// optional in dev mode to not waste time
	if (process.env.NODE_ENV === 'production') {
		if (
			!(
				publicEnv.PUBLIC_IMPRESS_FULLNAME &&
				publicEnv.PUBLIC_IMPRESS_STRASSE_HAUSNR &&
				publicEnv.PUBLIC_IMPRESS_PLZ_ORT &&
				publicEnv.PUBLIC_IMPRESS_TELEFON &&
				publicEnv.PUBLIC_IMPRESS_EMAIL
			)
		) {
			console.error(
				'One or more environment variables are missing:\n\nPUBLIC_IMPRESS_FULLNAME\nPUBLIC_IMPRESS_STRASSE_HAUSNR\nPUBLIC_IMPRESS_PLZ_ORT\nPUBLIC_IMPRESS_TELEFON\nPUBLIC_IMPRESS_EMAIL'
			);
			console.warn('Optional: PUBLIC_IMPRESS_ADDRZUSATZ');
			process.exit(1);
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	// don't redirect form data
	if (event.url.pathname == '/') {
		if (event.request.headers.get('content-type') == 'application/x-www-form-urlencoded') {
			return resolve(event);
		}
	}

	const jwt = event.cookies.get('jwt');

	if (!jwt && event.url.pathname !== '/') {
		console.log('redirecting to /');
		return Response.redirect(new URL('/', event.url));
	}

	if (jwt && event.url.pathname === '/') {
		console.log('redirecting to /dashboard');
		return Response.redirect(new URL('/dashboard', event.url));
	}

	return resolve(event);
};
