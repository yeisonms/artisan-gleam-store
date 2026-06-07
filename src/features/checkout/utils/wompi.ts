// Función auxiliar para abrir el widget de Wompi de forma programática (Opción A)
export const openWompiWidget = (
  amountInCents: number,
  reference: string,
  customerData: { email: string; fullName: string; phone?: string },
  onSuccess: (transaction: any) => void
) => {
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  console.log("Wompi Public Key from env:", publicKey);
  
  if (!publicKey) {
    console.error("Falta VITE_WOMPI_PUBLIC_KEY en .env");
    return;
  }

  // @ts-ignore
  const checkout = new WidgetCheckout({
    currency: "COP",
    amountInCents: amountInCents,
    reference: reference,
    publicKey: publicKey,
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
