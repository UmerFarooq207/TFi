import Link from "next/link"
import { ProductForm } from "../product-form"

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="admin-back">
        ← Back to catalogue
      </Link>
      <header className="admin-page-head">
        <div className="admin-page-head__lead">
          <p className="admin-eyebrow">Catalogue · New</p>
          <h1 className="admin-h1">
            Add new product<span className="accent">.</span>
          </h1>
          <p className="admin-page-head__sub">
            Capture the essentials, then dimensions, package, and pallet specifics.
            Set featured to surface this piece on the public home page.
          </p>
        </div>
      </header>
      <ProductForm />
    </div>
  )
}
