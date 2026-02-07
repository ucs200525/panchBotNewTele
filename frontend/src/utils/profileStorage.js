const PROFILES_KEY = 'vva_user_profiles';

export const saveProfile = (name, data) => {
    if (!name || !data) return;
    
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    profiles[name.toLowerCase().trim()] = {
        name: name.trim(),
        ...data,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getProfile = (name) => {
    if (!name) return null;
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    return profiles[name.toLowerCase().trim()] || null;
};

export const getAllProfiles = () => {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    return Object.values(profiles).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const deleteProfile = (name) => {
    if (!name) return;
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
    delete profiles[name.toLowerCase().trim()];
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};
