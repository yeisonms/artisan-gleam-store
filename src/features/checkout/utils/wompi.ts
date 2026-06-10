// Función para generar firma de integridad SHA-256
async function generateIntegritySignature(reference: string, amountInCents: number, currency: string, secret: string) {
  const dataString = `${reference}${amountInCents}${currency}${secret}`;
  const msgBuffer = new TextEncoder().encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Función auxiliar para abrir el widget de Wompi de forma programática (Opción A)
export const openWompiWidget = async (
  amountInCents: number,
  reference: string,
  customerData: { email: string; fullName: string; phone?: string },
  onSuccess: (transaction: any) => void
) => {
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  const integritySecret = import.meta.env.VITE_WOMPI_INTEGRITY_SECRET;
  
  console.log("Wompi Public Key from env:", publicKey);
  
  if (!publicKey) {
    console.error("Falta VITE_WOMPI_PUBLIC_KEY en .env");
    return;
  }

  // Generamos firma si existe el secreto de integridad
  let signature;
  if (integritySecret) {
    const hash = await generateIntegritySignature(reference, amountInCents, "COP", integritySecret);
    signature = { integrity: hash };
  }

  // @ts-ignore
  const checkout = new WidgetCheckout({
    currency: "COP",
    amountInCents: amountInCents,
    reference: reference,
    publicKey: publicKey,
    signature: signature, // Agregamos la firma de integridad
    customerData: {
      email: customerData.email,
      fullName: customerData.fullName,
      phoneNumber: customerData.phone,
      phoneNumberPrefix: "+57"
    }
  });

  checkout.open(function (result: any) {
    const transaction = result.transaction;
    if (transaction.status === "APPROVED") {
      onSuccess(transaction);
    } else {
      console.log("Transacción no aprobada o cancelada", transaction);
    }
  });
};
