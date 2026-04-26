import { ProductForm } from "../product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground/50 mb-1">
          Catalogue
        </p>
        <h1 className="font-heading text-2xl font-medium text-foreground">Add New Product</h1>
      </div>
      <ProductForm />
    </div>
  )
}
