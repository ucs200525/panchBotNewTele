function formatTime(date) {
  if (!date) return "N/A";
  if (typeof date === 'string') return date;
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

module.exports = { formatTime };
