// Calculo de valores de uma compra. Extraido de Purchase.jsx sem alteracao de
// formula para que a pagina de compra e a ferramenta WebMCP `getPurchaseQuote`
// nao possam divergir.

export function buildPurchaseQuote(event, ticketSelection, selectedAddons) {
  const ticketLines = Object.entries(ticketSelection)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [ticketId, type] = key.split('_');
      const ticket = event.tickets.find((t) => t.id === ticketId);
      const price = type === 'meia' ? ticket.halfPrice : ticket.price;
      return {
        label: `${ticket.name} (${type === 'meia' ? 'Meia' : 'Inteira'})`,
        qty,
        price,
        subtotal: qty * price,
      };
    });

  const addonLines = selectedAddons.map((id) => {
    const addon = event.addons.find((a) => a.id === id);
    return { label: addon?.name, price: addon?.price || 0 };
  });

  const ticketsTotal = ticketLines.reduce((s, l) => s + l.subtotal, 0);
  const addonsTotal = addonLines.reduce((s, l) => s + l.price, 0);
  const serviceFee = parseFloat((ticketsTotal * 0.1).toFixed(2));
  const total = ticketsTotal + addonsTotal + serviceFee;

  return { ticketLines, addonLines, ticketsTotal, addonsTotal, serviceFee, total };
}
