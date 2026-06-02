import User from '../models/User';

interface AdminBootstrapConfig {
  email: string;
  password: string;
  name: string;
}

function readAdminConfigFromEnv(): AdminBootstrapConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Admin User';

  if (!email && !password) {
    return null;
  }

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be set');
  }

  return {
    email,
    password,
    name,
  };
}

export async function ensureAdminUserFromEnv(): Promise<void> {
  const config = readAdminConfigFromEnv();

  if (!config) {
    return;
  }

  const existingUser = await User.findOne({ email: config.email });

  if (!existingUser) {
    await User.create({
      name: config.name,
      email: config.email,
      password: config.password,
      isAdmin: true,
    });
    console.log(`Admin bootstrap: created admin user ${config.email}`);
    return;
  }

  if (!existingUser.isAdmin) {
    existingUser.isAdmin = true;
    await existingUser.save();
    console.log(`Admin bootstrap: promoted user ${config.email} to admin`);
    return;
  }

  console.log(`Admin bootstrap: admin user ${config.email} already configured`);
}
