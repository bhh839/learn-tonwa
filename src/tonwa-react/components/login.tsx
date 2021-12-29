import { Login, Tonwa } from 'tonwa-core';

export async function createLogin(tonwa: Tonwa): Promise<Login> {
	let importCLogin = await import('../auth/CLogin');
	return new importCLogin.CLogin(tonwa);
}

export async function showRegister(tonwa: Tonwa): Promise<void> {
	let importCRegister = await import('../auth/register/CRegister');
	let c = new importCRegister.CRegister(tonwa);
	c.start();
}

export async function showForget(tonwa: Tonwa): Promise<void> {
	let importCRegister = await import('../auth/register/CRegister');
	let c = new importCRegister.CForget(tonwa);
	c.start();
}
