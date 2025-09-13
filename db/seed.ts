import { db, Users } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// Add seed user
	await db.insert(Users).values({
		id: '1a97b5f59ed4158d817b830e22a654d16d9857f23889a9bed2eea4d71b6f6fce',
		email: 'dan@d13z.dev',
		passwordHash: '28fc18a77b45ff312435c567990d94556d7651fc43a3a85e97191f64a90306cd',
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Dan Vel',
		image: 'https://example.com/image.png',
		emailVerified: new Date(),
	});
	await db.insert(Users).values({
		id: '119744f6bdbda671a688646a7970c82c66a7f7f81d4af07104d294619328d106',
		email: 'test@test.com',
		name: 'Test',
		passwordHash: 'd52ae90124f662a3b21236eb39cf5adfe392850ad89b098b9a089ac243c650b2',
		createdAt: new Date(),
		updatedAt: new Date(),
		emailVerified: new Date(),
	})
}
