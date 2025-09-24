export const generateId = () => Math.random().toString(36).substring(2, 9);

export const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(11, 12);
