import { useSearchParams } from "react-router-dom";
import CustomJewelryForm from "@/features/solicitudes/components/CustomJewelryForm";

export default function CustomRequest() {
  const [searchParams] = useSearchParams();
  const categoryHint = searchParams.get("producto") || "";

  return (
    <div className="container pt-36 pb-16 md:pt-40 md:pb-24 min-h-screen max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
          Diseño a Medida
        </h1>
        <div className="w-16 h-[1px] bg-gold mx-auto mb-6" />
        <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto font-light">
          Cuéntanos tu visión y nuestros maestros artesanos crearán una pieza única e irrepetible, hecha exclusivamente para ti.
        </p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-sm shadow-sm border border-border/40">
        <CustomJewelryForm initialCategoryHint={categoryHint} />
      </div>
    </div>
  );
}
