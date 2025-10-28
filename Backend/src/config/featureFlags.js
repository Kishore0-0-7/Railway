const featureFlags = {
  enableAdminRegistration: true,
};

const setAdminRegistrationEnabled = (isEnabled) => {
  featureFlags.enableAdminRegistration = Boolean(isEnabled);
};

const isAdminRegistrationEnabled = () => featureFlags.enableAdminRegistration;

module.exports = {
  isAdminRegistrationEnabled,
  setAdminRegistrationEnabled,
};
