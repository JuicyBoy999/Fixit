import pool from '../config/db.js';

// One-time backfill: create technician_profiles rows for any users with
// role='technician' that don't already have a profile. Mirrors the insert in
// technicianModel.createTechnicianProfileForUser (used at signup).
async function run() {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.city
       FROM users u
       LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.role = 'technician' AND tp.id IS NULL`
  );

  if (rows.length === 0) {
    console.log('No missing technician profiles. Nothing to backfill.');
    await pool.end();
    return;
  }

  for (const u of rows) {
    await pool.query(
      `INSERT INTO technician_profiles
         (user_id, full_name, title, bio, location, years_experience, verification_status)
       VALUES ($1, $2, 'Repair Technician',
               'Fixit-certified technician ready to help with your repair.', $3, 0, 'approved')`,
      [u.id, `${u.first_name} ${u.last_name}`.trim(), u.city]
    );
    console.log(`Created profile for user ${u.id} (${u.first_name} ${u.last_name})`);
  }

  console.log(`\nBackfilled ${rows.length} technician profile(s).`);
  await pool.end();
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
