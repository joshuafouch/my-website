import { dev } from '$app/environment';

export const title = 'Joshua Fouch';
export const description = "Joshua's Digital Garden";
export const url = dev ? 'http://localhost:5173/' : 'https://joshuafouch.vercel.app/';

export const links = [
	{ href: '/', text: 'Home' },
	{ href: '/about', text: 'About' },
	{ href: '/projects', text: 'Projects' },
	{ href: '/blog', text: 'Devblog' },
	{ href: '/contact', text: 'Contact' }
];
