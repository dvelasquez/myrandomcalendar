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
}
