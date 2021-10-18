export const get_random_id = () => Math.random().toString(36).substr(2, 9) + '_' + Date.now();
