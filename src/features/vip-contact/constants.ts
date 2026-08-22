/** Ported verbatim from V1's VIP_WHATSAPP_TEMPLATE. */
export function vipWhatsAppMessage(firstName: string): string {
  return `Dearly beloved ${firstName},

On behalf of our lead pastor, Pastor Daniel Olawande and the entire RCCG The Envoys family, we sincerely thank you for worshipping with us on Sunday.

It is not by chance that you came. God ordered your feet here, and we are so glad you obeyed His call to worship with us at The Home of Supernatural Upgrades.

We seam our faith with yours, trusting God for a manifestation of the prophetic words you have received and praying for divine encounters for you and your household.
Our Experience Team will call to check up on you this week.

We can't wait to welcome you to church next Sunday.
The Lord bless you!

I honour you and you're super amazing!`;
}

export function vipWhatsAppLink(fullName: string, phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const firstName = fullName.trim().split(" ")[0] || fullName;
  const intlPhone = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(vipWhatsAppMessage(firstName))}`;
}
