export default {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    try {
      // 🛑 SAFETY SWITCH: This logic runs ONLY in development (Replit).
      // On Staging/Production, this function stops here to prevent overwriting real data.
      if (process.env.NODE_ENV !== 'development') {
        strapi.log.info('🔒 Governance: Skipping auto-admin creation in non-development environment.');
        return;
      }

      // --- Everything below only happens in Replit/Dev ---

      const devEmail = process.env.DEV_ADMIN_EMAIL;
      const devPass = process.env.DEV_ADMIN_PASSWORD;

      if (!devEmail || !devPass) {
        strapi.log.warn('⚠️ DEV_ADMIN_EMAIL or DEV_ADMIN_PASSWORD not set. Skipping.');
        return;
      }

      const existingDev = await strapi.db.query('admin::user').findOne({ 
        where: { email: devEmail } 
      });

      const superAdminRole = await strapi.db.query('admin::role').findOne({ 
        where: { code: 'strapi-super-admin' } 
      });

      if (!existingDev && superAdminRole) {
        const hashedPass = await strapi.service('admin::auth').hashPassword(devPass);

        await strapi.db.query('admin::user').create({
          data: {
            email: devEmail,
            password: hashedPass,
            firstname: 'Aaron',
            lastname: 'Developer',
            isActive: true,
            blocked: false,
            roles: [superAdminRole.id],
          },
        });
        strapi.log.info(`✅ DEV ADMIN CREATED (Dev Only): ${devEmail}`);
      }
    } catch (error) {
      strapi.log.error('Bootstrap error:', error);
    }
  },
};