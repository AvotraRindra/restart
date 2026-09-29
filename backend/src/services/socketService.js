let io = null;
function setIO(instance) { io = instance; }
function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}
function emitToConversation(conversationId, event, payload) {
  if (io) io.to(`conversation:${conversationId}`).emit(event, payload);
}
module.exports = { setIO, emitToUser, emitToConversation };
