exports.createWhatsAppLink = (phone, message) => {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/91${phone}?text=${encoded}`
}
