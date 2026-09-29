let io = null;
const onlineCounts = new Map();

function setIO(instance) { io = instance; }
function emitToUser(userId, event, payload) { if (io) io.to(`user:${userId}`).emit(event, payload); }
function emitToConversation(conversationId, event, payload) { if (io) io.to(`conversation:${conversationId}`).emit(event, payload); }
function addOnline(userId) {
  const id = Number(userId);
  onlineCounts.set(id, (onlineCounts.get(id) || 0) + 1);
  return onlineCounts.get(id);
}
function removeOnline(userId) {
  const id = Number(userId);
  const next = Math.max(0, (onlineCounts.get(id) || 1) - 1);
  if (next === 0) onlineCounts.delete(id); else onlineCounts.set(id, next);
  return next;
}
function getOnlineIds() { return [...onlineCounts.keys()]; }
function isOnline(userId) { return onlineCounts.has(Number(userId)); }
function broadcastPresence(userId, online) {
  if (io) io.emit("presence:update", { userId: Number(userId), online: Boolean(online) });
}
module.exports = { setIO, emitToUser, emitToConversation, addOnline, removeOnline, getOnlineIds, isOnline, broadcastPresence };
